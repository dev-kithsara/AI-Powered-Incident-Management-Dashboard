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


# ── Risk Analysis (Aggregated) ─────────────────────────────────────────────
class RiskSummary(BaseModel):
    total_incidents: int
    avg_risk_score:  float
    critical_count:  int
    high_count:      int
    medium_count:    int
    low_count:       int
    open_incidents:  int


class MonthlyTrendPoint(BaseModel):
    month:    str          # "YYYY-MM"
    LOW:      int = 0
    MEDIUM:   int = 0
    HIGH:     int = 0
    CRITICAL: int = 0


class DepartmentRisk(BaseModel):
    department:      str
    avg_risk_score:  float
    total_incidents: int
    critical_count:  int


class CategoryBreakdown(BaseModel):
    category:        str
    total:           int
    high_risk_count: int
    avg_risk_score:  float


class AtRiskIncident(BaseModel):
    id:          int
    title:       str
    severity:    str
    category:    Optional[str]
    department:  Optional[str]
    risk_score:  float
    created_at:  Optional[str]
    status:      str


class RiskAnalysisResponse(BaseModel):
    summary:            RiskSummary
    monthly_trend:      List[MonthlyTrendPoint]
    department_risk:    List[DepartmentRisk]
    category_breakdown: List[CategoryBreakdown]
    top_at_risk:        List[AtRiskIncident]
