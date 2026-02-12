import os
import time
from dotenv import load_dotenv

# Load .env file
load_dotenv()
from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
import logging
from typing import AsyncIterator

import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.database.mongo import close_mongo_connection, connect_to_mongo
from app.routers import datasets, visualization, telemetry, simple_upload


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan handler.
    Starts background connection task and ensures graceful shutdown.
    """
    logger = logging.getLogger("uvicorn.error")
    setup_logging()
    
    logger.info("/// INITIATING_SYSTEM_BOOT_SEQUENCE")
    
    # Trigger DB connection in background to avoid blocking server readiness
    async def start_db():
        try:
            logger.info("/// CONNECTING_TO_REMOTE_DATA_CLUSTERS...")
            await connect_to_mongo()
            # Perform indexing in background
            from app.database.mongo import _create_indexes
            await _create_indexes()
            logger.info("/// DATA_CLUSTER_SYNCHRONIZATION_COMPLETE")
        except Exception as e:
            logger.error(f"/// SYSTEM_DEGRADED: Database synchronization failed: {e}")

    # Launch background task
    db_task = asyncio.create_task(start_db())
    
    try:
        yield
    finally:
        logger.info("/// INITIATING_SHUTDOWN_PROTOCOL")
        db_task.cancel()
        try:
            await close_mongo_connection()
        except:
            pass


def create_app() -> FastAPI:
    """
    FastAPI application factory.
    """
    app = FastAPI(
        title="AI Data Quality Auditor",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS configuration (can be tightened via env settings)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers - simple_upload takes priority for /upload, /report, /status
    app.include_router(simple_upload.router, prefix="/api")
    app.include_router(datasets.router, prefix="/api")
    app.include_router(visualization.router, prefix="/api")
    app.include_router(telemetry.router, prefix="/api/telemetry")

    @app.get("/api/health")
    async def health_check():
        from app.database.mongo import is_db_connected
        db_status = await is_db_connected()
        return {
            "status": "online" if db_status else "degraded",
            "gateway": "active",
            "cluster_sync": db_status,
            "timestamp": time.time()
        }

    # Exception handlers
    register_exception_handlers(app)

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.app_port,
        reload=True,
    )

