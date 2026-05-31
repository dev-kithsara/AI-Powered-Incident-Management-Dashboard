from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.embeddings import find_similar_incidents, process_incident
from models.schemas import SimilarIncidentsResponse
import time

router = APIRouter()


@router.get("/similar-incidents", response_model=SimilarIncidentsResponse)
async def get_similar_incidents(
    incident_id: int,
    top_k: int = 5,
    db: AsyncSession = Depends(get_db),
):
    if top_k < 1 or top_k > 20:
        raise HTTPException(status_code=422, detail="top_k must be between 1 and 20")
    start   = time.time()
    results = await find_similar_incidents(db, incident_id, top_k)
    if results is None:
        raise HTTPException(
            status_code=404,
            detail=f"Incident {incident_id} not found or not yet AI-processed"
        )
    return SimilarIncidentsResponse(
        source_incident_id=incident_id,
        similar_incidents=results,
        processing_time_ms=round((time.time() - start) * 1000, 2),
        method="sentence_transformer",
    )


@router.post("/process")
async def process_incident_endpoint(body: dict, db: AsyncSession = Depends(get_db)):
    incident_id = body.get("incident_id")
    if not incident_id:
        raise HTTPException(status_code=422, detail="incident_id required")
    success = await process_incident(db, int(incident_id))
    if not success:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return {"message": f"Incident {incident_id} processed", "success": True}
