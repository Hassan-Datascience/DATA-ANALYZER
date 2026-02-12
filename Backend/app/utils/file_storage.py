import os
from pathlib import Path
from typing import Tuple

from fastapi import UploadFile

from app.core.config import settings


def ensure_storage_root() -> Path:
    """
    Ensure the file storage root directory exists.
    """
    root = Path(settings.file_storage_root)
    root.mkdir(parents=True, exist_ok=True)
    return root


async def save_upload_to_disk(file: UploadFile) -> Tuple[str, int]:
    """
    Save an uploaded file to disk using chunked writes.

    Returns the absolute file path and file size in bytes.
    """
    storage_root = ensure_storage_root()
    destination = storage_root / file.filename

    # Avoid overwriting existing files by appending a counter if needed.
    counter = 1
    base_name = destination.stem
    suffix = destination.suffix
    while destination.exists():
        destination = storage_root / f"{base_name}_{counter}{suffix}"
        counter += 1

    size = 0
    with destination.open("wb") as out_file:
        while True:
            chunk = await file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            out_file.write(chunk)
            size += len(chunk)

    # Reset file pointer for potential re-use by FastAPI
    await file.seek(0)

    return os.path.abspath(destination), size

