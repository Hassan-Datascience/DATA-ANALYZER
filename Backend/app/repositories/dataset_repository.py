from datetime import datetime
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.dataset import Dataset


class DatasetRepository:
    """
    Repository for dataset documents.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["datasets"]

    async def create(
        self,
        filename: str,
        file_size: int,
        storage_path: str,
        name: Optional[str] = None,
    ) -> Dataset:
        now = datetime.utcnow()
        doc = {
            "filename": filename,
            "file_size": file_size,
            "storage_path": storage_path,
            "name": name or filename,
            "rows": None,
            "columns": None,
            "status": "uploaded",
            "uploaded_at": now,
            "processed_at": None,
        }
        result = await self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return self._document_to_model(doc)

    async def get_by_id(self, dataset_id: str) -> Optional[Dataset]:
        oid = ObjectId(dataset_id)
        doc = await self._collection.find_one({"_id": oid})
        if not doc:
            return None
        return self._document_to_model(doc)

    async def update_status(self, dataset_id: str, status: str) -> None:
        oid = ObjectId(dataset_id)
        await self._collection.update_one({"_id": oid}, {"$set": {"status": status}})

    async def update_stats(
        self,
        dataset_id: str,
        rows: int,
        columns: int,
    ) -> None:
        oid = ObjectId(dataset_id)
        await self._collection.update_one(
            {"_id": oid},
            {
                "$set": {
                    "rows": rows,
                    "columns": columns,
                    "processed_at": datetime.utcnow(),
                    "status": "completed",
                }
            },
        )

    async def list_all(self, limit: int = 20) -> list[Dataset]:
        cursor = self._collection.find().sort("uploaded_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [self._document_to_model(doc) for doc in docs]

    def _document_to_model(self, doc: dict) -> Dataset:
        return Dataset(
            id=doc["_id"],
            filename=doc["filename"],
            file_size=doc["file_size"],
            storage_path=doc["storage_path"],
            rows=doc.get("rows"),
            columns=doc.get("columns"),
            status=doc["status"],
            uploaded_at=doc["uploaded_at"],
            processed_at=doc.get("processed_at"),
            name=doc.get("name"),
        )

