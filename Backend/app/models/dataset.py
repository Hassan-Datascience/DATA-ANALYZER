from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from bson import ObjectId


@dataclass
class Dataset:
    """
    Domain model representing a dataset document in MongoDB.
    """

    id: ObjectId
    filename: str
    file_size: int
    storage_path: str
    rows: Optional[int]
    columns: Optional[int]
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime]
    name: Optional[str] = None

