from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from services.classifier import predict_risk, train_classifier, get_model_status
from models.schemas import RiskPredictionRequest, RiskPredictionResponse

router = APIRouter()


@router.post("/predict-risk", response_model=RiskPredictionResponse)
async def predict_risk_endpoint(body: RiskPredictionRequest):
    result = await predict_risk(
        title=body.title,
        description=body.description,
        category=body.category,
        department=body.department,
    )
    return RiskPredictionResponse(**result)


@router.post("/retrain-classifier")
async def retrain_classifier(db: AsyncSession = Depends(get_db)):
    return await train_classifier(db)


@router.get("/model-status")
async def model_status(db: AsyncSession = Depends(get_db)):
    return await get_model_status(db)
