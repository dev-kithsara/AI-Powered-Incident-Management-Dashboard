from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import logging

load_dotenv()

from db.database import init_db
from routers import similar, clustering, risk, health
from scheduler import setup_scheduler, shutdown_scheduler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)

AI_API_KEY = os.getenv("AI_API_KEY", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Analytics Service starting up...")
    await init_db()
    setup_scheduler()
    yield
    shutdown_scheduler()
    logger.info("🛑 AI Analytics Service shut down.")


app = FastAPI(
    title="IMS AI Analytics Service",
    description="NLP similarity, K-Means clustering & predictive risk scoring for the Incident Management System.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_api_key(request: Request):
    """Skip key check on /health; enforce on all other AI routes."""
    if request.url.path.endswith("/health"):
        return
    if AI_API_KEY and request.headers.get("X-API-Key") != AI_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")


# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(health.router,     prefix="/api/ai", tags=["health"])
app.include_router(similar.router,    prefix="/api/ai", tags=["similarity"],
                   dependencies=[Depends(verify_api_key)])
app.include_router(clustering.router, prefix="/api/ai", tags=["clustering"],
                   dependencies=[Depends(verify_api_key)])
app.include_router(risk.router,       prefix="/api/ai", tags=["risk"],
                   dependencies=[Depends(verify_api_key)])
