from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
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

# ── Keyword sets for heuristic fallback (used when model is not trained yet) ──
# Each frozenset contains lowercase phrases that signal that severity level.
_CRITICAL_KW = frozenset([
    "critical", "catastrophic", "emergency", "explosion", "fire", "fatality",
    "total failure", "complete outage", "all systems down", "system down",
    "data breach", "data loss", "compromised", "ransomware", "disaster",
])
_HIGH_KW = frozenset([
    "major", "power outage", "outage", "server down", "severe", "failure",
    "down", "crash", "unavailable", "significant", "production", "breach",
    "corrupted", "widespread", "infrastructure",
])
_MEDIUM_KW = frozenset([
    "degraded", "intermittent", "partial", "slow", "timeout", "error",
    "issue", "problem", "warning", "unstable", "flapping",
])
_LOW_KW = frozenset([
    "minor", "informational", "advisory", "notice", "scheduled", "low impact",
    "cosmetic", "trivial",
])


def _keyword_severity(title: str, description: str) -> tuple:
    """
    Heuristic severity detection via keyword matching.
    Returns (severity_label: str, risk_score: float, confidence: float).

    The score is derived from which bucket the text falls into, plus a small
    bonus for each additional matching keyword (capped at the bucket ceiling).
    Confidence is intentionally modest (0.40–0.65) to signal this is an
    estimate, not a trained-model prediction.
    """
    text_lower = (title + " " + description).lower()

    crit_hits = sum(1 for kw in _CRITICAL_KW if kw in text_lower)
    high_hits  = sum(1 for kw in _HIGH_KW  if kw in text_lower)
    med_hits   = sum(1 for kw in _MEDIUM_KW if kw in text_lower)
    low_hits   = sum(1 for kw in _LOW_KW   if kw in text_lower)

    if crit_hits >= 1 or high_hits >= 2:
        label = "CRITICAL"
        base  = 85.0
        bonus = min(7.0, crit_hits * 3.0 + high_hits * 1.5)
        conf  = min(0.65, 0.50 + crit_hits * 0.07 + high_hits * 0.03)
    elif high_hits >= 1:
        label = "HIGH"
        base  = 68.0
        bonus = min(9.0, high_hits * 2.5)
        conf  = min(0.60, 0.45 + high_hits * 0.06)
    elif med_hits >= 1:
        label = "MEDIUM"
        base  = 42.0
        bonus = min(12.0, med_hits * 3.0)
        conf  = min(0.55, 0.40 + med_hits * 0.05)
    else:
        label = "LOW"
        base  = 12.0
        bonus = min(10.0, low_hits * 3.0)
        conf  = 0.42

    score = min(100.0, base + bonus)
    return label, round(score, 1), round(conf, 3)


def _weighted_risk_score(proba: np.ndarray, le: LabelEncoder) -> float:
    """
    Compute the *expected* risk score as the probability-weighted average
    of each class's fixed score:

        E[score] = Σ P(class_i) × SEVERITY_TO_SCORE[class_i]

    This gives a continuous value that always moves in the same direction as
    the dominant class probability — fixing the MEDIUM-label / 100-score
    inconsistency that occurs when a fixed lookup is used instead.

    Example:
      proba = [P(CRITICAL)=0.72, P(HIGH)=0.18, P(MEDIUM)=0.07, P(LOW)=0.03]
      score = 0.72×92 + 0.18×75 + 0.07×50 + 0.03×20 = 84.8  → aligns with CRITICAL
    """
    score = 0.0
    for i, p in enumerate(proba):
        label = le.inverse_transform([i])[0]
        score += p * SEVERITY_TO_SCORE.get(label, 50.0)
    return round(float(score), 1)


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

    # ── Train base Gradient Boosting model ───────────────────────────────
    clf = GradientBoostingClassifier(
        n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42
    )
    clf.fit(X, y)

    # ── Calibrate probabilities (Platt / isotonic scaling) ────────────────
    # GradientBoostingClassifier's predict_proba is not well-calibrated by
    # default — it tends to push probabilities to extremes on training data
    # and collapse to near-uniform on novel inputs, causing "30% confidence"
    # outputs like the one being fixed here.
    #
    # CalibratedClassifierCV wraps the already-fitted model and learns a
    # monotonic mapping from raw scores → true probabilities using k-fold
    # cross-validation.  We need ≥ (cv_folds × num_classes) samples.
    cv_folds = max(2, min(5, len(rows) // 2))
    try:
        calibrated_clf = CalibratedClassifierCV(
            clf, method="isotonic", cv=cv_folds
        )
        calibrated_clf.fit(X, y)
        final_clf = calibrated_clf
        logger.info("✅ Probability calibration (isotonic, %d folds) applied", cv_folds)
    except Exception as cal_err:
        # Fall back to uncalibrated model if calibration fails
        # (e.g. too few samples per class for the requested folds).
        logger.warning("Calibration skipped (%s) — using uncalibrated GBC", cal_err)
        final_clf = clf

    # ── Cross-val accuracy (on uncalibrated clf — for reporting only) ─────
    cv_acc = float(
        cross_val_score(clf, X, y, cv=cv_folds, scoring="accuracy").mean()
    )

    y_pred    = clf.predict(X)
    precision = float(precision_score(y, y_pred, average="weighted", zero_division=0))
    recall    = float(recall_score(y, y_pred, average="weighted", zero_division=0))
    f1        = float(f1_score(y, y_pred, average="weighted", zero_division=0))

    bundle = {
        "classifier":          final_clf,   # calibrated model stored
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
    """
    Predict risk for a new incident.

    When the model is not yet trained, falls back to keyword-based heuristics
    that keep risk_score, risk_label, and confidence logically consistent.

    When the model IS trained:
    - risk_score  = probability-weighted expected score (continuous, 0-100)
    - risk_label  = argmax class (the most probable severity)
    - confidence  = P(argmax class) from the *calibrated* classifier

    This ensures the three values always agree:
      high risk_score  ↔  HIGH/CRITICAL label  ↔  high confidence
    """
    bundle = load_classifier()

    # ── Heuristic path (model not trained yet) ────────────────────────────
    if not bundle:
        label, score, conf = _keyword_severity(title, description)
        logger.debug(
            "Heuristic predict: label=%s score=%.1f conf=%.2f", label, score, conf
        )
        return {
            "risk_score":           score,
            "risk_label":          label,
            "confidence":          conf,
            "contributing_factors": ["keyword_heuristic"],
        }

    # ── Trained-model path ────────────────────────────────────────────────
    le:   LabelEncoder = bundle["label_encoder"]
    cats: list         = bundle["categorical_columns"]

    # FIX: title was duplicated in the original code; use it only once.
    text_content = f"Title: {title}. Description: {description}"
    embedding    = encode_text(text_content).reshape(1, -1)

    cat_df       = pd.DataFrame([{"category": category or "Unknown",
                                   "department": department or "Unknown"}])
    cat_dummies  = pd.get_dummies(cat_df, prefix=["cat", "dept"])
    cat_features = cat_dummies.reindex(columns=cats, fill_value=0).values.astype(float)
    X            = np.hstack([embedding, cat_features])

    # Calibrated predict_proba → realistic probability distribution
    clf         = bundle["classifier"]
    proba       = clf.predict_proba(X)[0]          # shape: (n_classes,)
    pred_idx    = int(np.argmax(proba))
    pred_label  = le.inverse_transform([pred_idx])[0]
    confidence  = float(proba[pred_idx])

    # FIX: use probability-weighted expected score rather than a fixed lookup.
    # This guarantees risk_score is consistent with the full probability
    # distribution — not just the winning class.
    risk_score = _weighted_risk_score(proba, le)

    logger.debug(
        "Model predict: label=%s score=%.1f conf=%.2f proba=%s",
        pred_label, risk_score, confidence,
        {le.inverse_transform([i])[0]: round(float(p), 3) for i, p in enumerate(proba)},
    )

    # ── Contributing factors (categorical features only) ──────────────────
    try:
        # CalibratedClassifierCV wraps the base estimator; access it via
        # .estimator (sklearn ≥ 1.2) or .base_estimator (older).
        base_clf = getattr(clf, "estimator", None) or getattr(clf, "base_estimator", clf)
        importances    = base_clf.feature_importances_
        top_idx        = np.argsort(importances)[::-1][:5]
        all_feat_names = [f"embed_{i}" for i in range(embedding.shape[1])] + cats
        factors = [
            all_feat_names[i]
            for i in top_idx
            if i < len(all_feat_names) and not all_feat_names[i].startswith("embed_")
        ][:3]
        if not factors:
            factors = [f"{pred_label.lower()}_risk"]
    except Exception:
        factors = [f"{pred_label.lower()}_risk"]

    return {
        "risk_score":           risk_score,
        "risk_label":          pred_label,
        "confidence":          round(confidence, 4),
        "contributing_factors": factors,
    }


async def get_risk_analysis(db: AsyncSession) -> dict:
    """
    Aggregates historical incident data to power the Predictive Risk Analysis dashboard.
    Returns: monthly trends, department risk scores, category breakdown, top at-risk open incidents.
    """
    # ── 1. Monthly Risk Trend (last 12 months) ─────────────────────────────
    trend_rows = (await db.execute(text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
            severity,
            COUNT(*) AS cnt
        FROM incidents
        WHERE deleted_at IS NULL
          AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month, severity
        ORDER BY month ASC, severity
    """))).fetchall()

    # Build a dict: { "2024-06": { "LOW": 3, "MEDIUM": 5, ... }, ... }
    trend_map: dict = {}
    for month, severity, cnt in trend_rows:
        if month not in trend_map:
            trend_map[month] = {"month": month, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        trend_map[month][severity] = int(cnt)
    monthly_trend = sorted(trend_map.values(), key=lambda x: x["month"])

    # ── 2. Risk by Department ──────────────────────────────────────────────
    dept_rows = (await db.execute(text("""
        SELECT
            COALESCE(department, 'Unknown') AS department,
            AVG(COALESCE(predicted_risk_score, 
                CASE severity
                    WHEN 'LOW'      THEN 20.0
                    WHEN 'MEDIUM'   THEN 50.0
                    WHEN 'HIGH'     THEN 75.0
                    WHEN 'CRITICAL' THEN 92.0
                    ELSE 30.0
                END
            )) AS avg_risk,
            COUNT(*) AS total,
            SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_count
        FROM incidents
        WHERE deleted_at IS NULL
          AND department IS NOT NULL AND department != ''
        GROUP BY department
        ORDER BY avg_risk DESC
        LIMIT 10
    """))).fetchall()

    dept_risk = [
        {
            "department":     row[0],
            "avg_risk_score": round(float(row[1]), 1),
            "total_incidents": int(row[2]),
            "critical_count":  int(row[3]),
        }
        for row in dept_rows
    ]

    # ── 3. Risk by Category ────────────────────────────────────────────────
    cat_rows = (await db.execute(text("""
        SELECT
            COALESCE(category, 'Uncategorized') AS category,
            COUNT(*) AS total,
            SUM(CASE WHEN severity IN ('HIGH','CRITICAL') THEN 1 ELSE 0 END) AS high_risk_count,
            AVG(COALESCE(predicted_risk_score,
                CASE severity
                    WHEN 'LOW'      THEN 20.0
                    WHEN 'MEDIUM'   THEN 50.0
                    WHEN 'HIGH'     THEN 75.0
                    WHEN 'CRITICAL' THEN 92.0
                    ELSE 30.0
                END
            )) AS avg_risk
        FROM incidents
        WHERE deleted_at IS NULL
        GROUP BY category
        ORDER BY avg_risk DESC
        LIMIT 8
    """))).fetchall()

    category_breakdown = [
        {
            "category":       row[0],
            "total":          int(row[1]),
            "high_risk_count": int(row[2]),
            "avg_risk_score": round(float(row[3]), 1),
        }
        for row in cat_rows
    ]

    # ── 4. Top At-Risk Open Incidents ─────────────────────────────────────
    open_rows = (await db.execute(text("""
        SELECT
            id, title, severity, category, department,
            COALESCE(predicted_risk_score,
                CASE severity
                    WHEN 'LOW'      THEN 20.0
                    WHEN 'MEDIUM'   THEN 50.0
                    WHEN 'HIGH'     THEN 75.0
                    WHEN 'CRITICAL' THEN 92.0
                    ELSE 30.0
                END
            ) AS risk_score,
            created_at,
            status
        FROM incidents
        WHERE deleted_at IS NULL
          AND status IN ('OPEN','IN_PROGRESS','UNDER_REVIEW')
        ORDER BY risk_score DESC, created_at ASC
        LIMIT 10
    """))).fetchall()

    top_at_risk = [
        {
            "id":          row[0],
            "title":       row[1],
            "severity":    row[2],
            "category":    row[3],
            "department":  row[4],
            "risk_score":  round(float(row[5]), 1),
            "created_at":  row[6].isoformat() if row[6] else None,
            "status":      row[7],
        }
        for row in open_rows
    ]

    # ── 5. Overall Summary ─────────────────────────────────────────────────
    summary_row = (await db.execute(text("""
        SELECT
            COUNT(*)                                                                     AS total,
            AVG(COALESCE(predicted_risk_score,
                CASE severity
                    WHEN 'LOW'      THEN 20.0
                    WHEN 'MEDIUM'   THEN 50.0
                    WHEN 'HIGH'     THEN 75.0
                    WHEN 'CRITICAL' THEN 92.0
                    ELSE 30.0
                END))                                                                    AS avg_risk,
            SUM(CASE WHEN severity = 'CRITICAL'               THEN 1 ELSE 0 END)        AS critical,
            SUM(CASE WHEN severity = 'HIGH'                   THEN 1 ELSE 0 END)        AS high,
            SUM(CASE WHEN severity = 'MEDIUM'                 THEN 1 ELSE 0 END)        AS medium,
            SUM(CASE WHEN severity = 'LOW'                    THEN 1 ELSE 0 END)        AS low,
            SUM(CASE WHEN status IN ('OPEN','IN_PROGRESS','UNDER_REVIEW') THEN 1 ELSE 0 END) AS open_count
        FROM incidents
        WHERE deleted_at IS NULL
    """))).fetchone()

    summary = {
        "total_incidents":   int(summary_row[0]) if summary_row[0] else 0,
        "avg_risk_score":    round(float(summary_row[1]), 1) if summary_row[1] else 0.0,
        "critical_count":    int(summary_row[2]) if summary_row[2] else 0,
        "high_count":        int(summary_row[3]) if summary_row[3] else 0,
        "medium_count":      int(summary_row[4]) if summary_row[4] else 0,
        "low_count":         int(summary_row[5]) if summary_row[5] else 0,
        "open_incidents":    int(summary_row[6]) if summary_row[6] else 0,
    }

    return {
        "summary":            summary,
        "monthly_trend":      monthly_trend,
        "department_risk":    dept_risk,
        "category_breakdown": category_breakdown,
        "top_at_risk":        top_at_risk,
    }


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
