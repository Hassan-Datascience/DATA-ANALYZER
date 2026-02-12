from dataclasses import dataclass
from typing import Any, Dict, List

from bson import ObjectId


@dataclass
class ColumnProfile:
    """
    Domain model representing per-column profiling information.
    """

    id: ObjectId
    dataset_id: ObjectId
    column_name: str
    metrics: Dict[str, Any]
    issues: List[str]

