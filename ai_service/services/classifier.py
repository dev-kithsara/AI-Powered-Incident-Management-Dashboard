from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
from sklearn.metrics import precision_score, recall_score, f1_score
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from services.embeddings import encode_text, parse_vec
import numpy as np
import pandas as pd
import pickle
import os
import logging

logger = logging.getLogger(__name__)

MODEL_DIR        = os.getenv("MODEL_CACHE_DIR", "/app/models")
CLASSIFIER_PATH  = os.path.join(MODEL_DIR, "risk_classifier.pkl")
os.makedirs(MODEL_DIR, exist_ok=True)

SEVERITY_TO_SCORE = {"LOW": 20.0, "MEDIUM": 50.0, "HIGH": 75.0, "CRITICAL": 92.0}


def load_classifier():
    if not os.path.exists(CLASSIFIER_PATH):
        return None
    with open(CLASSIFIER_PATH, "rb") as f:
        return pickle.load(f)


async def train_classifier(db: AsyncSession) -> dict:
    result = await db.execute(text("""
        SELECT i.id, i.title, i.description, i.severity, i.category, i.department,
               ae.embedding::text
        FROM   incidents i
        JOIN   ai_embeddings ae ON ae.incident_id = i.id
        WHERE  i.status      = 'CLOSED'
          AND  i.deleted_at  IS NULL
          AND  i.severity    IS NOT NULL
        ORDER  BY i.id
    """))
    rows = result.fetchall()

    if len(rows) < 10:
        logger.warning(f"Insufficient training data: {len(rows)} samples (need ≥ 10)")
        return {"trained": False, "reason": f"Need ≥ 10 closed incidents, have {len(rows)}"}

    df = pd.DataFrame(rows, columns=["id", "title", "description", "severity",
                                      "category", "department", "embedding"])
    df["category"]   = df["category"].fillna("Unknown")
    df["department"] = df["department"].fillna("Unknown")

    X_embeddings = np.vstack(df["embedding"].apply(parse_vec).values)
    cat_dummies  = pd.get_dummies(df[["category", "department"]], prefix=["cat", "dept"])
    categorical_columns = cat_dummies.columns.tolist()
    X_categorical = cat_dummies.values.astype(float)
    X = np.hstack([X_embeddings, X_categorical])

    le = LabelEncoder()
    y  = le.fit_transform(df["severity"])

    clf = GradientBoostingClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
    clf.fit(X, y)

    cv_folds = max(2, min(5, len(rows) // 2))
    cv_acc   = float(cross_val_score(clf, X, y, cv=cv_folds, scoring="accuracy").mean())

    y_pred    = clf.predict(X)
    precision = float(precision_score(y, y_pred, average="weighted", zero_division=0))
    recall    = float(recall_score(y, y_pred, average="weighted", zero_division=0))
    f1        = float(f1_score(y, y_pred, average="weighted", zero_division=0))

    bundle = {
        "classifier":          clf,
        "label_encoder":       le,
        "categorical_columns": categorical_columns,
        "accuracy":            cv_acc,
        "precision":           precision,
        "recall":              recall,
        "f1_score":            f1,
        "training_samples":    len(rows),
    }
    with open(CLASSIFIER_PATH, "wb") as f:
        pickle.dump(bundle, f)

    await db.execute(text("""
        INSERT INTO model_metrics
          (model_type, accuracy, precision_score, recall_score, f1_score, training_samples, trained_at)
        VALUES ('classifier', :acc, :prec, :rec, :f1, :n, NOW())
    """), {"acc": cv_acc, "prec": precision, "rec": recall, "f1": f1, "n": len(rows)})
    await db.commit()

    logger.info(f"✅ Classifier trained: acc={cv_acc:.2%}, n={len(rows)}")
    return {"trained": True, "accuracy": cv_acc, "precision": precision,
            "recall": recall, "f1_score": f1, "training_samples": len(rows)}


async def predict_risk(title: str, description: str,
                       category: str = None, department: str = None) -> dict:
    bundle = load_classifier()
    if not bundle:
        # Heuristic fallback when model not trained yet
        word_count   = len((title + " " + description).split())
        heuristic    = min(100, max(10, word_count * 2))
        return {"risk_score": float(heuristic), "risk_label": "MEDIUM",
                "confidence": 0.3, "contributing_factors": ["heuristic_only"]}

    clf:  GradientBoostingClassifier = bundle["classifier"]
    le:   LabelEncoder               = bundle["label_encoder"]
    cats: list                        = bundle["categorical_columns"]

    text_content = f"Title: {title} Title: {title} Description: {description}"
    embedding    = encode_text(text_content).reshape(1, -1)

    cat_df       = pd.DataFrame([{"category": category or "Unknown",
                                   "department": department or "Unknown"}])
    cat_dummies  = pd.get_dummies(cat_df, prefix=["cat", "dept"])
    cat_features = cat_dummies.reindex(columns=cats, fill_value=0).values.astype(float)
    X            = np.hstack([embedding, cat_features])

    proba              = clf.predict_proba(X)[0]
    pred_idx           = int(np.argmax(proba))
    predicted_severity = le.inverse_transform([pred_idx])[0]
    confidence         = float(proba[pred_idx])
    risk_score         = SEVERITY_TO_SCORE.get(predicted_severity, 50.0)

    try:
        importances     = clf.feature_importances_
        top_idx         = np.argsort(importances)[::-1][:5]
        all_feat_names  = [f"embed_{i}" for i in range(embedding.shape[1])] + cats
        factors         = [all_feat_names[i] for i in top_idx if i < len(all_feat_names)]
        factors         = [f for f in factors if not f.startswith("embed_")][:3]
        if not factors:
            factors = [f"{predicted_severity.lower()}_risk"]
    except Exception:
        factors = [f"{predicted_severity.lower()}_risk"]

    return {"risk_score": risk_score, "risk_label": predicted_severity,
            "confidence": confidence, "contributing_factors": factors}


async def get_model_status(db: AsyncSession) -> dict:
    clf_row = (await db.execute(text("""
        SELECT accuracy, precision_score, recall_score, f1_score, training_samples, trained_at
        FROM   model_metrics WHERE model_type = 'classifier'
        ORDER  BY trained_at DESC LIMIT 1
    """))).fetchone()

    cl_row = (await db.execute(text("""
        SELECT optimal_k, silhouette_score, training_samples, trained_at
        FROM   model_metrics WHERE model_type = 'clustering'
        ORDER  BY trained_at DESC LIMIT 1
    """))).fetchone()

    return {
        "classifier_trained": os.path.exists(CLASSIFIER_PATH),
        "clustering_trained": bool(cl_row),
        "training_samples":   int(clf_row[4])    if clf_row and clf_row[4] else None,
        "accuracy":           float(clf_row[0])  if clf_row and clf_row[0] else None,
        "precision":          float(clf_row[1])  if clf_row and clf_row[1] else None,
        "recall":             float(clf_row[2])  if clf_row and clf_row[2] else None,
        "f1_score":           float(clf_row[3])  if clf_row and clf_row[3] else None,
        "optimal_k":          int(cl_row[0])     if cl_row  and cl_row[0]  else None,
        "silhouette_score":   float(cl_row[1])   if cl_row  and cl_row[1]  else None,
        "trained_at":         clf_row[5]          if clf_row else None,
    }
