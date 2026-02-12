from typing import Optional

from fastapi import UploadFile

from app.repositories.dataset_repository import DatasetRepository
from app.utils.file_storage import save_upload_to_disk


class UploadService:
    """
    Service handling dataset uploads.
    """

    def __init__(self, dataset_repo: DatasetRepository) -> None:
        self._dataset_repo = dataset_repo

    async def handle_upload(self, file: UploadFile, name: Optional[str] = None):
        """
        Persist the uploaded file and create a dataset record.
        """
        storage_path, size = await save_upload_to_disk(file)
        dataset = await self._dataset_repo.create(
            filename=file.filename,
            file_size=size,
            storage_path=storage_path,
            name=name,
        )
        from app.schemas.dataset import UploadResponse  # local import to avoid cycles

        return UploadResponse(
            dataset_id=str(dataset.id),
            report_id=str(dataset.id),  # Sync with user request for alias
            name=dataset.name or dataset.filename,
            filename=dataset.filename,
            rows=dataset.rows or 0,
            columns=dataset.columns or 0,
            file_size_bytes=dataset.file_size,
            status=dataset.status,
            error_message=None,
            created_at=dataset.uploaded_at,
        )

