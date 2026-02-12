from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse


class DatasetNotFoundError(Exception):
    def __init__(self, dataset_id: str) -> None:
        self.dataset_id = dataset_id


class InvalidDatasetStateError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message


def register_exception_handlers(app: FastAPI) -> None:
    """
    Register application-wide exception handlers.
    """

    @app.exception_handler(DatasetNotFoundError)
    async def dataset_not_found_handler(
        request: Request, exc: DatasetNotFoundError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={"detail": f"Dataset '{exc.dataset_id}' not found."},
        )

    @app.exception_handler(InvalidDatasetStateError)
    async def invalid_dataset_state_handler(
        request: Request, exc: InvalidDatasetStateError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={"detail": exc.message},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        # Fallback handler for uncaught exceptions
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error."},
        )

