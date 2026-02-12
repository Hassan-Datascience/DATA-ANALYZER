from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.mongo import get_database
from app.repositories.audit_report_repository import AuditReportRepository
from app.repositories.column_profile_repository import ColumnProfileRepository
from app.repositories.dataset_repository import DatasetRepository
from app.services.audit_service import AuditService
from app.services.upload_service import UploadService


def get_db() -> AsyncIOMotorDatabase:
    return get_database()


def get_dataset_repository(db: AsyncIOMotorDatabase = Depends(get_db)) -> DatasetRepository:
    return DatasetRepository(db)


def get_column_profile_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> ColumnProfileRepository:
    return ColumnProfileRepository(db)


def get_audit_report_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> AuditReportRepository:
    return AuditReportRepository(db)


def get_upload_service(
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
) -> UploadService:
    return UploadService(dataset_repo)


def get_audit_service(
    dataset_repo: DatasetRepository = Depends(get_dataset_repository),
    column_repo: ColumnProfileRepository = Depends(get_column_profile_repository),
    report_repo: AuditReportRepository = Depends(get_audit_report_repository),
) -> AuditService:
    return AuditService(dataset_repo, column_repo, report_repo)

