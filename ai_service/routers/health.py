from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status":     "healthy",
        "service":    "IMS AI Analytics Service",
        "timestamp":  datetime.utcnow().isoformat(),
        "models_dir": os.getenv("MODEL_CACHE_DIR", "/app/models"),
    }
