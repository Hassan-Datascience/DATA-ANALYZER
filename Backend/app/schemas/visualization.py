from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DatasetSummary(BaseModel):
    dataset_id: str
    name: str
    rows: int
    columns: int


class ColumnProfileViz(BaseModel):
    column: str
    metrics: Dict[str, Any]
    issues: List[str]


class ProfileVisualizationResponse(BaseModel):
    dataset_summary: DatasetSummary
    quality_scores: Dict[str, Any]
    column_profiles: List[ColumnProfileViz]


class DistributionsResponse(BaseModel):
    numeric_distributions: List[Dict[str, Any]]
    categorical_distributions: List[Dict[str, Any]]


class AnomaliesVisualizationResponse(BaseModel):
    anomaly_summary: Dict[str, Any]
    anomalies_by_column: List[Dict[str, Any]]
    scatter_plots: List[Dict[str, Any]]


class CorrelationsResponse(BaseModel):
    numeric_correlations: Dict[str, Any]
    categorical_associations: Dict[str, Any]


class QualityReportResponse(BaseModel):
    audit_metadata: Dict[str, Any]
    executive_summary: Dict[str, Any]
    issues_summary: Dict[str, Any]
    column_insights: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

