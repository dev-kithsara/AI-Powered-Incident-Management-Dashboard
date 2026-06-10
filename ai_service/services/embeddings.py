from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import hashlib
import logging
import os

logger = logging.getLogger(__name__)

# ── Singleton model ────────────────────────────────────────────────────────
_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer model all-MiniLM-L6-v2 ...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("✅ SentenceTransformer loaded")
    return _model


MIN_SIMILARITY = float(os.getenv("MIN_SIMILARITY_THRESHOLD", "0.4"))


# ── Text utilities ─────────────────────────────────────────────────────────
def create_incident_text(incident: dict) -> str:
    """Combine incident fields into a single string for embedding."""
    parts = [
        f"Title: {incident.get('title', '')} Title: {incident.get('title', '')}",
        f"Description: {incident.get('description', '')}",
        f"Root Cause: {incident.get('root_cause', '')}",
        f"Category: {incident.get('category', '')}",
        f"Lessons: {incident.get('lessons_learned', '')}",
    ]
    return " | ".join(p for p in parts if p.split(": ", 1)[1].strip())


def compute_text_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


def encode_text(text: str) -> np.ndarray:
    return get_model().encode(text, normalize_embeddings=True)


# ── DB helpers ─────────────────────────────────────────────────────────────
def parse_vec(vec_str: str) -> np.ndarray:
    return np.array([float(x) for x in vec_str.strip("[]").split(",")])


async def store_embedding(db, incident_id: int, embedding: np.ndarray,
                          text_hash: str, umap_x=None, umap_y=None):
    from sqlalchemy import text
    vec_str = "[" + ",".join(map(str, embedding.tolist())) + "]"
    await db.execute(text("""
        INSERT INTO ai_embeddings (incident_id, embedding, text_hash, umap_x, umap_y, updated_at)
        VALUES (:incident_id, CAST(:embedding AS vector), :text_hash, :umap_x, :umap_y, NOW())
        ON CONFLICT (incident_id)
        DO UPDATE SET embedding  = EXCLUDED.embedding,
                      text_hash  = EXCLUDED.text_hash,
                      umap_x     = EXCLUDED.umap_x,
                      umap_y     = EXCLUDED.umap_y,
                      updated_at = NOW()
    """), {"incident_id": incident_id, "embedding": vec_str,
           "text_hash": text_hash, "umap_x": umap_x, "umap_y": umap_y})
    await db.commit()


# ── Core processing ────────────────────────────────────────────────────────
async def process_incident(db, incident_id: int) -> bool:
    from sqlalchemy import text
    result = await db.execute(text("""
        SELECT i.id, i.title, i.description, i.category,
               rc.description AS root_cause,
               cl.lessons_learned
        FROM   incidents i
        LEFT JOIN incident_root_causes rc ON rc.incident_id = i.id
        LEFT JOIN incident_closures    cl ON cl.incident_id = i.id
        WHERE  i.id = :id AND i.deleted_at IS NULL
    """), {"id": incident_id})
    row = result.fetchone()
    if not row:
        logger.warning(f"Incident {incident_id} not found")
        return False

    inc          = dict(row._mapping)
    text_content = create_incident_text(inc)
    text_hash    = compute_text_hash(text_content)

    # Skip if unchanged
    existing = await db.execute(
        text("SELECT text_hash FROM ai_embeddings WHERE incident_id = :id"),
        {"id": incident_id}
    )
    existing_row = existing.fetchone()
    if existing_row and existing_row[0] == text_hash:
        await db.execute(text("UPDATE incidents SET ai_processed = TRUE WHERE id = :id"),
                         {"id": incident_id})
        await db.commit()
        return True

    embedding = encode_text(text_content)
    await store_embedding(db, incident_id, embedding, text_hash)
    await db.execute(text("UPDATE incidents SET ai_processed = TRUE WHERE id = :id"),
                     {"id": incident_id})
    await db.commit()
    logger.info(f"✅ Embedding processed for incident {incident_id}")
    return True


async def process_all_unprocessed(db) -> int:
    """Process each incident in its own isolated session to prevent transaction cascade failures."""
    from sqlalchemy import text
    from db.database import AsyncSessionLocal

    # Fetch the list of IDs using the passed-in session
    result = await db.execute(text("""
        SELECT id FROM incidents
        WHERE  ai_processed = FALSE
          AND  deleted_at   IS NULL
        LIMIT 50
    """))
    ids = [row[0] for row in result.fetchall()]
    if not ids:
        return 0

    count = 0
    for incident_id in ids:
        # Each incident gets its own fresh session — one failure won't abort others
        async with AsyncSessionLocal() as fresh_db:
            try:
                if await process_incident(fresh_db, incident_id):
                    count += 1
            except Exception as e:
                logger.error(f"Error processing incident {incident_id}: {e}")
                try:
                    await fresh_db.rollback()
                except Exception:
                    pass
    return count


# ── Similarity search ──────────────────────────────────────────────────────
async def find_similar_incidents(db, incident_id: int, top_k: int = 5):
    from sqlalchemy import text

    source = await db.execute(text("""
        SELECT ae.embedding::text
        FROM   ai_embeddings ae
        WHERE  ae.incident_id = :id
    """), {"id": incident_id})
    source_row = source.fetchone()
    if not source_row:
        return None  # not yet processed

    all_rows = (await db.execute(text("""
        SELECT ae.incident_id, ae.embedding::text, i.title, i.severity, i.category
        FROM   ai_embeddings ae
        JOIN   incidents i ON i.id = ae.incident_id
        WHERE  ae.incident_id != :id AND i.deleted_at IS NULL
    """), {"id": incident_id})).fetchall()

    if not all_rows:
        return []

    source_vec     = parse_vec(source_row[0]).reshape(1, -1)
    candidate_vecs = np.array([parse_vec(r[1]) for r in all_rows])
    similarities   = cosine_similarity(source_vec, candidate_vecs)[0]

    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [
        {
            "incident_id":      all_rows[i][0],
            "title":            all_rows[i][2],
            "severity":         all_rows[i][3],
            "category":         all_rows[i][4],
            "similarity_score": float(similarities[i]),
        }
        for i in top_indices
        if float(similarities[i]) >= MIN_SIMILARITY
    ]
