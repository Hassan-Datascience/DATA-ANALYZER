from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, UploadFile, status, Query

from app.core.dependencies import get_audit_service, get_upload_service
from app.schemas.dataset import AuditRequestResponse, DatasetStatusResponse, UploadResponse
from app.schemas.report import AuditReportResponse
from app.services.audit_service import AuditService
from app.services.upload_service import UploadService

import logging

router = APIRouter(tags=["datasets"])
logger = logging.getLogger(__name__)


@router.get(
    "/reports",
    response_model=list[DatasetStatusResponse],
)
async def list_reports(
    limit: int = Query(20, ge=1, le=100),
    audit_service: AuditService = Depends(get_audit_service),
) -> list[DatasetStatusResponse]:
    """
    List all uploaded datasets and their audit status.
    """
    # This requires a new method in AuditService or just usage of repo directly.
    # I'll use the repo directly via dependency if possible or update AuditService.
    # Let's check dependencies for dataset_repo access.
    # For now, I'll update AuditService to have a list method for cleaner code.
    return await audit_service.list_datasets(limit=limit)


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_dataset(
    file: UploadFile,
    name: str = Form(...),
    upload_service: UploadService = Depends(get_upload_service),
) -> UploadResponse:
    """
    Upload a CSV dataset for later auditing.
    """
    allowed_extensions = {".csv", ".json", ".xlsx"}
    ext = file.filename.lower()[file.filename.rfind("."):]
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}",
        )

    return await upload_service.handle_upload(file, name=name)


@router.post(
    "/audit/{dataset_id}",
    response_model=AuditRequestResponse,
)
async def trigger_audit(
    dataset_id: str,
    background_tasks: BackgroundTasks,
    audit_service: AuditService = Depends(get_audit_service),
) -> AuditRequestResponse:
    """
    Trigger a background audit for a dataset.
    """
    background_tasks.add_task(audit_service.run_audit, dataset_id=dataset_id)
    dataset = await audit_service.get_dataset_status(dataset_id)
    return AuditRequestResponse(
        message="Audit started",
        dataset_id=str(dataset.id),
        status=dataset.status,
    )


@router.get(
    "/report/{dataset_id}",
    response_model=AuditReportResponse,
)
async def get_report(
    dataset_id: str,
    audit_service: AuditService = Depends(get_audit_service),
) -> AuditReportResponse:
    """
    Retrieve the full audit report for a dataset.
    """
    report = await audit_service.get_audit_report(dataset_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audit report not found for dataset.",
        )
    return report


@router.get(
    "/status/{dataset_id}",
    response_model=DatasetStatusResponse,
)
async def get_status(
    dataset_id: str,
    audit_service: AuditService = Depends(get_audit_service),
) -> DatasetStatusResponse:
    """
    Retrieve the processing status of a dataset.
    """
    dataset = await audit_service.get_dataset_status(dataset_id)
    error_msg = None
    if dataset.status == "failed":
        report = await audit_service.get_audit_report(dataset_id)
        if report:
            error_msg = report.error_message

    return DatasetStatusResponse(
        dataset_id=str(dataset.id),
        name=dataset.name,
        filename=dataset.filename,
        status=dataset.status,
        rows=dataset.rows,
        columns=dataset.columns,
        error_message=error_msg,
        uploaded_at=dataset.uploaded_at,
        processed_at=dataset.processed_at,
    )

