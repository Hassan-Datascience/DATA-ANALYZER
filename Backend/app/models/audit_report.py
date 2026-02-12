from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId


@dataclass
class AuditReport:
    """
    Domain model representing an audit report document.
    """

    id: ObjectId
    dataset_id: ObjectId
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

