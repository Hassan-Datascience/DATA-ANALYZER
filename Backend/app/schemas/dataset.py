from datetime import datetime
from typing import Literal, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class PyObjectId(ObjectId):
    """
    Helper type for Pydantic <-> BSON ObjectId interoperability.
    """

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


DatasetStatusLiteral = Literal["uploaded", "processing", "completed", "failed"]


class DatasetBase(BaseModel):
    filename: str
    file_size: int
    storage_path: str
    rows: Optional[int] = None
    columns: Optional[int] = None
    status: DatasetStatusLiteral
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

    model_config = {"arbitrary_types_allowed": True, "from_attributes": True}


class DatasetSchema(DatasetBase):
    id: PyObjectId = Field(alias="_id")


class UploadResponse(BaseModel):
    dataset_id: str
    report_id: str  # Alias for frontend expectation
    name: str
    filename: str
    rows: int
    columns: int
    file_size_bytes: int
    status: DatasetStatusLiteral
    error_message: Optional[str] = None
    created_at: datetime


class DatasetStatusResponse(BaseModel):
    dataset_id: str
    name: str | None = None
    filename: str
    status: DatasetStatusLiteral
    rows: Optional[int] = None
    columns: Optional[int] = None
    error_message: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None


class AuditRequestResponse(BaseModel):
    message: str
    dataset_id: str
    status: DatasetStatusLiteral

