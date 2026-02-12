from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ColumnProfileSchema(BaseModel):
    column_name: str
    metrics: Dict[str, Any]
    issues: List[str]


class AuditReportResponse(BaseModel):
    dataset_id: str
    reliability_score: float
    status: str
    issue_summary: Dict[str, Any]
    anomaly_count: int
    duplicate_count: int
    recommendations: List[str]
    created_at: Optional[datetime] = None
    error_message: Optional[str] = None
    is_sampled: bool = False
    sample_size: int = 0
    columns: List[ColumnProfileSchema] = []

