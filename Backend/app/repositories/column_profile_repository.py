from typing import List

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ColumnProfileRepository:
    """
    Repository for per-column profile documents.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["column_profiles"]

    async def replace_for_dataset(
        self,
        dataset_id: str,
        profiles: dict,
        issues: dict,
    ) -> None:
        """
        Replace all column profiles for a dataset.
        """
        oid = ObjectId(dataset_id)
        await self._collection.delete_many({"dataset_id": oid})

        docs: List[dict] = []
        for col_name, metrics in profiles.items():
            docs.append(
                {
                    "dataset_id": oid,
                    "column_name": col_name,
                    "metrics": metrics,
                    "issues": issues.get(col_name, []),
                }
            )

        if docs:
            await self._collection.insert_many(docs)

    async def get_for_dataset(self, dataset_id: str) -> List[dict]:
        oid = ObjectId(dataset_id)
        cursor = self._collection.find({"dataset_id": oid})
        return [doc async for doc in cursor]

