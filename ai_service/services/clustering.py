from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from services.embeddings import parse_vec
import numpy as np
import pickle
import os
import logging

logger = logging.getLogger(__name__)

MODEL_DIR   = os.getenv("MODEL_CACHE_DIR", "/app/models")
KMEANS_PATH = os.path.join(MODEL_DIR, "kmeans_model.pkl")
os.makedirs(MODEL_DIR, exist_ok=True)


def find_optimal_k(embeddings: np.ndarray, k_range=(2, 8)) -> int:
    n = len(embeddings)
    if n < 4:
        return 2
    best_k, best_score = k_range[0], -1.0
    max_k = min(k_range[1], n - 1)
    for k in range(k_range[0], max_k + 1):
        try:
            km     = KMeans(n_clusters=k, random_state=42, n_init="auto")
            labels = km.fit_predict(embeddings)
            if len(set(labels)) < 2:
                continue
            score = silhouette_score(embeddings, labels)
            if score > best_score:
                best_score, best_k = score, k
        except Exception:
            continue
    return best_k


def reduce_to_2d(embeddings: np.ndarray) -> np.ndarray:
    try:
        import umap
        n_neighbors = max(2, min(15, len(embeddings) - 1))
        reducer = umap.UMAP(n_components=2, random_state=42, n_neighbors=n_neighbors)
        return reducer.fit_transform(embeddings)
    except Exception as e:
        logger.warning(f"UMAP failed ({e}), falling back to PCA")
        from sklearn.decomposition import PCA
        return PCA(n_components=2).fit_transform(embeddings)


async def load_all_embeddings(db: AsyncSession):
    result = await db.execute(text("""
        SELECT ae.incident_id, ae.embedding::text, i.title, i.severity, i.category
        FROM   ai_embeddings ae
        JOIN   incidents i ON i.id = ae.incident_id
        WHERE  i.deleted_at IS NULL
        ORDER  BY ae.incident_id
    """))
    return result.fetchall()


async def generate_cluster_labels(db: AsyncSession, cluster_assignments: dict) -> dict:
    labels = {}
    for cluster_id, incident_ids in cluster_assignments.items():
        if not incident_ids:
            labels[cluster_id] = f"Cluster {cluster_id}"
            continue
        placeholders = ", ".join([f":id{i}" for i in range(len(incident_ids))])
        params       = {f"id{i}": iid for i, iid in enumerate(incident_ids)}
        result       = await db.execute(
            text(f"SELECT title || ' ' || COALESCE(description,'') FROM incidents WHERE id IN ({placeholders})"),
            params
        )
        texts = [row[0] for row in result.fetchall()]
        try:
            vectorizer = TfidfVectorizer(max_features=3, stop_words="english")
            vectorizer.fit_transform(texts)
            terms = vectorizer.get_feature_names_out()
            labels[cluster_id] = terms[0].capitalize() if len(terms) > 0 else f"Cluster {cluster_id}"
        except Exception:
            labels[cluster_id] = f"Cluster {cluster_id}"
    return labels


async def refit_clustering(db: AsyncSession) -> dict:
    rows = await load_all_embeddings(db)
    if len(rows) < 4:
        logger.info("Not enough data for clustering (need ≥ 4)")
        return {}

    incident_ids      = [row[0] for row in rows]
    embeddings_matrix = np.array([parse_vec(row[1]) for row in rows])

    optimal_k     = find_optimal_k(embeddings_matrix)
    kmeans        = KMeans(n_clusters=optimal_k, random_state=42, n_init="auto")
    cluster_labels = kmeans.fit_predict(embeddings_matrix)

    sil_score = -1.0
    try:
        if len(set(cluster_labels)) > 1:
            sil_score = float(silhouette_score(embeddings_matrix, cluster_labels))
    except Exception:
        pass

    coords_2d = reduce_to_2d(embeddings_matrix)

    cluster_assignments: dict = {i: [] for i in range(optimal_k)}
    for i, incident_id in enumerate(incident_ids):
        cid = int(cluster_labels[i])
        cluster_assignments[cid].append(incident_id)
        await db.execute(
            text("UPDATE incidents SET cluster_id = :cid WHERE id = :iid"),
            {"cid": cid, "iid": incident_id}
        )
        await db.execute(
            text("UPDATE ai_embeddings SET umap_x = :x, umap_y = :y WHERE incident_id = :iid"),
            {"x": float(coords_2d[i][0]), "y": float(coords_2d[i][1]), "iid": incident_id}
        )
    await db.commit()

    text_labels = await generate_cluster_labels(db, cluster_assignments)

    await db.execute(text("""
        INSERT INTO model_metrics (model_type, optimal_k, silhouette_score, training_samples, trained_at)
        VALUES ('clustering', :k, :sil, :n, NOW())
    """), {"k": optimal_k, "sil": sil_score, "n": len(incident_ids)})
    await db.commit()

    with open(KMEANS_PATH, "wb") as f:
        pickle.dump({"model": kmeans, "labels": text_labels, "optimal_k": optimal_k}, f)

    logger.info(f"✅ K-Means: k={optimal_k}, silhouette={sil_score:.3f}, n={len(incident_ids)}")
    return text_labels


async def get_cluster_map(db: AsyncSession) -> dict:
    result = await db.execute(text("""
        SELECT ae.incident_id, i.title, i.severity, i.category,
               ae.umap_x, ae.umap_y, COALESCE(i.cluster_id, 0) AS cluster
        FROM   ai_embeddings ae
        JOIN   incidents i ON i.id = ae.incident_id
        WHERE  ae.umap_x IS NOT NULL AND ae.umap_y IS NOT NULL
          AND  i.deleted_at IS NULL
        ORDER  BY ae.incident_id
    """))
    rows = result.fetchall()

    labels: dict = {}
    if os.path.exists(KMEANS_PATH):
        with open(KMEANS_PATH, "rb") as f:
            bundle = pickle.load(f)
            labels = bundle.get("labels", {})

    clusters       = [
        {"incident_id": r[0], "title": r[1], "severity": r[2], "category": r[3],
         "x": float(r[4]), "y": float(r[5]), "cluster": int(r[6])}
        for r in rows
    ]
    unique_clusters = list(set(c["cluster"] for c in clusters))

    return {
        "clusters":        clusters,
        "cluster_labels":  {str(k): v for k, v in labels.items()},
        "total_incidents": len(clusters),
        "num_clusters":    len(unique_clusters),
    }
