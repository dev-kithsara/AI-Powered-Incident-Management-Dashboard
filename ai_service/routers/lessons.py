from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from sqlalchemy import text
from services.embeddings import encode_text, parse_vec
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/lessons-learned/recommend")
async def recommend_lessons(body: dict, db: AsyncSession = Depends(get_db)):
    title = body.get("title", "")
    description = body.get("description", "")
    category = body.get("category", "")
    department = body.get("department", "")
    top_k = body.get("top_k", 3)

    if not title and not description:
        return {"recommendations": []}

    # 1. Embed the draft text
    draft_text = f"Title: {title}. Description: {description}"
    draft_embedding = encode_text(draft_text).reshape(1, -1)

    # 2. Query closed incidents with lessons learned
    result = await db.execute(text("""
        SELECT i.id, i.title, i.category, i.severity, i.department,
               cl.lessons_learned, cl.closure_summary,
               ae.embedding::text
        FROM   incidents i
        JOIN   incident_closures cl ON cl.incident_id = i.id
        JOIN   ai_embeddings ae ON ae.incident_id = i.id
        WHERE  i.status = 'CLOSED'
          AND  i.deleted_at IS NULL
          AND  cl.lessons_learned IS NOT NULL
          AND  cl.lessons_learned != ''
    """))
    rows = result.fetchall()
    if not rows:
        return {"recommendations": []}

    # 3. Calculate cosine similarity
    candidate_embeddings = np.array([parse_vec(r[7]) for r in rows])
    similarities = cosine_similarity(draft_embedding, candidate_embeddings)[0]

    # 4. Sort and return top K
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    recommendations = []
    for idx in top_indices:
        score = float(similarities[idx])
        # Include suggestions above 0.25 similarity
        if score >= 0.25:
            row = rows[idx]
            recommendations.append({
                "incident_id": row[0],
                "title": row[1],
                "category": row[2],
                "severity": row[3],
                "department": row[4],
                "lessons_learned": row[5],
                "closure_summary": row[6],
                "similarity_score": round(score, 3)
            })

    return {"recommendations": recommendations}
