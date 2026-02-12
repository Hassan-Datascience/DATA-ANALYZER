from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, UploadFile, status

from app.core.dependencies import get_audit_service, get_upload_service
from app.schemas.dataset import AuditRequestResponse, DatasetStatusResponse, UploadResponse
from app.schemas.report import AuditReportResponse
from app.services.audit_service import AuditService
from app.services.upload_service import UploadService

router = APIRouter(tags=["datasets"])


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
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported.",
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
    return DatasetStatusResponse(
        dataset_id=str(dataset.id),
        name=dataset.name,
        filename=dataset.filename,
        status=dataset.status,
        rows=dataset.rows,
        columns=dataset.columns,
        uploaded_at=dataset.uploaded_at,
        processed_at=dataset.processed_at,
    )

