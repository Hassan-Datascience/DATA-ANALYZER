from datetime import datetime
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.audit_report import AuditReport


class AuditReportRepository:
    """
    Repository for audit report documents.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["audit_reports"]

    async def upsert_report(
        self,
        dataset_id: str,
        reliability_score: float,
        status: str,
        issue_summary: dict,
        anomaly_count: int,
        duplicate_count: int,
        recommendations: list[str],
        *,
        error_message: Optional[str] = None,
        is_sampled: bool = False,
        sample_size: int = 0,
    ) -> AuditReport:
        oid = ObjectId(dataset_id)
        now = datetime.utcnow()
        doc = {
            "dataset_id": oid,
            "reliability_score": reliability_score,
            "status": status,
            "issue_summary": issue_summary,
            "anomaly_count": anomaly_count,
            "duplicate_count": duplicate_count,
            "recommendations": recommendations,
            "created_at": now,
            "error_message": error_message,
            "is_sampled": is_sampled,
            "sample_size": sample_size,
        }
        await self._collection.update_one(
            {"dataset_id": oid},
            {"$set": doc},
            upsert=True,
        )
        stored = await self._collection.find_one({"dataset_id": oid})
        return self._document_to_model(stored)

    async def get_by_dataset_id(self, dataset_id: str) -> Optional[AuditReport]:
        oid = ObjectId(dataset_id)
        doc = await self._collection.find_one({"dataset_id": oid})
        if not doc:
            return None
        return self._document_to_model(doc)

    def _document_to_model(self, doc: dict) -> AuditReport:
        return AuditReport(
            id=doc["_id"],
            dataset_id=doc["dataset_id"],
            reliability_score=doc["reliability_score"],
            status=doc["status"],
            issue_summary=doc.get("issue_summary", {}),
            anomaly_count=doc.get("anomaly_count", 0),
            duplicate_count=doc.get("duplicate_count", 0),
            recommendations=doc.get("recommendations", []),
            created_at=doc.get("created_at"),
            error_message=doc.get("error_message"),
            is_sampled=doc.get("is_sampled", False),
            sample_size=doc.get("sample_size", 0),
        )

