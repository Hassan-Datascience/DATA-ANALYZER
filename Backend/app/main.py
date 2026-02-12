# Add this at the very top of app/main.py
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Rest of the imports
from fastapi import FastAPI
from contextlib import asynccontextmanager
from typing import AsyncIterator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.database.mongo import close_mongo_connection, connect_to_mongo
from app.routers import datasets, visualization, telemetry


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    Application lifespan handler.

    Initializes logging and MongoDB connection on startup,
    then gracefully closes the connection on shutdown.
    """
    setup_logging()
    try:
        await connect_to_mongo()
    except Exception as e:
        print(f"WARNING: Failed to connect to MongoDB: {e}. Running in degraded mode.")
    
    try:
        yield
    finally:
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

    # Routers
    app.include_router(datasets.router, prefix="/api")
    app.include_router(visualization.router, prefix="/api")
    app.include_router(telemetry.router, prefix="/api")

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

