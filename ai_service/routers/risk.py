from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.classifier import predict_risk, train_classifier, get_model_status, get_risk_analysis
from services.embeddings import process_all_unprocessed
from services.clustering import refit_clustering
from services.seeder import seed_baseline_incidents
from models.schemas import RiskPredictionRequest, RiskPredictionResponse, RiskAnalysisResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/predict-risk", response_model=RiskPredictionResponse)
async def predict_risk_endpoint(body: RiskPredictionRequest):
    result = await predict_risk(
        title=body.title,
        description=body.description,
        category=body.category,
        department=body.department,
    )
    return RiskPredictionResponse(**result)


@router.get("/risk-analysis", response_model=RiskAnalysisResponse)
async def risk_analysis_endpoint(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated predictive risk analysis data:
    - Overall summary statistics
    - Monthly incident trend by severity (last 12 months)
    - Average risk score per department
    - Incident breakdown by category
    - Top 10 open incidents with highest predicted risk
    """
    return await get_risk_analysis(db)


@router.post("/retrain-classifier")
async def retrain_classifier(db: AsyncSession = Depends(get_db)):
    return await train_classifier(db)


@router.get("/model-status")
async def model_status(db: AsyncSession = Depends(get_db)):
    return await get_model_status(db)


@router.post("/run-pipeline")
async def run_pipeline(db: AsyncSession = Depends(get_db)):
    """
    Manually trigger the full AI pipeline:
    1. Embed all unprocessed incidents (sentence-transformer)
    2. Refit K-Means clustering + UMAP
    3. Retrain the Gradient Boosting classifier

    Returns a summary of what each stage did.
    """
    logger.info("🔧 Manual pipeline trigger received")

    # Stage 1 — Embeddings
    embedded = await process_all_unprocessed(db)
    logger.info("Pipeline stage 1: embedded %d incidents", embedded)

    # Stage 2 — Clustering (only refit if there's something new)
    cluster_result = await refit_clustering(db)

    # Stage 3 — Classifier
    train_result = await train_classifier(db)

    return {
        "embedded_count":  embedded,
        "clustering":      cluster_result,
        "classifier":      train_result,
        "message": (
            "✅ Pipeline complete — classifier trained successfully."
            if train_result.get("trained")
            else f"⚠️ Pipeline ran but classifier not trained: {train_result.get('reason', 'unknown')}"
        ),
    }


@router.post("/seed-baseline")
async def seed_baseline(db: AsyncSession = Depends(get_db)):
    """
    Insert 30 diverse baseline incidents (CRITICAL/HIGH/MEDIUM/LOW) so the
    Gradient Boosting classifier has enough labelled data to train.

    After inserting, the full AI pipeline is automatically triggered so
    embeddings are generated and the model trains immediately.

    This endpoint is idempotent — calling it multiple times will not
    create duplicate incidents.
    """
    logger.info("🌱 Seed-baseline request received")

    # Step 1 — Insert baseline incidents
    seed_result = await seed_baseline_incidents(db)

    # Step 2 — Immediately run the full pipeline so training happens now
    embedded = await process_all_unprocessed(db)
    cluster_result = await refit_clustering(db)
    train_result = await train_classifier(db)

    return {
        "seed":      seed_result,
        "embedded":  embedded,
        "clustering": cluster_result,
        "classifier": train_result,
        "message": (
            "✅ Baseline data seeded and classifier trained successfully!"
            if train_result.get("trained")
            else (
                f"🌱 Baseline incidents inserted ({seed_result['inserted']} new). "
                f"Classifier status: {train_result.get('reason', 'check logs')}"
            )
        ),
    }
