from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ── Similar Incidents ──────────────────────────────────────────────────────
class SimilarIncidentResult(BaseModel):
    incident_id:      int
    title:            str
    severity:         str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    category:         Optional[str] = None


class SimilarIncidentsResponse(BaseModel):
    source_incident_id: int
    similar_incidents:  List[SimilarIncidentResult]
    processing_time_ms: float
    method:             str = "sentence_transformer"


# ── Cluster Map ────────────────────────────────────────────────────────────
class ClusterPoint(BaseModel):
    incident_id: int
    title:       str
    severity:    str
    category:    Optional[str]
    x:           float
    y:           float
    cluster:     int


class ClusterMapResponse(BaseModel):
    clusters:        List[ClusterPoint]
    cluster_labels:  Dict[str, str]
    total_incidents: int
    num_clusters:    int


# ── Risk Prediction ────────────────────────────────────────────────────────
class RiskPredictionRequest(BaseModel):
    title:       str            = Field(..., min_length=3, max_length=255)
    description: str            = Field(..., min_length=10)
    category:    Optional[str]  = None
    department:  Optional[str]  = None


class RiskPredictionResponse(BaseModel):
    risk_score:           float = Field(..., ge=0, le=100)
    risk_label:           str
    confidence:           float = Field(..., ge=0, le=1)
    contributing_factors: List[str] = []


# ── Model Status ───────────────────────────────────────────────────────────
class ModelStatusResponse(BaseModel):
    classifier_trained: bool
    clustering_trained: bool
    training_samples:   Optional[int]
    accuracy:           Optional[float]
    precision:          Optional[float]
    recall:             Optional[float]
    f1_score:           Optional[float]
    optimal_k:          Optional[int]
    silhouette_score:   Optional[float]
    trained_at:         Optional[datetime]


# ── Process Request ────────────────────────────────────────────────────────
class ProcessRequest(BaseModel):
    incident_id: int
