from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_mongo_client: Optional[AsyncIOMotorClient] = None
_mongo_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """
    Initialize MongoDB connection using Motor.
    """
    global _mongo_client, _mongo_db

    if _mongo_client is not None:
        return

    _mongo_client = AsyncIOMotorClient(settings.mongodb_uri)
    _mongo_db = _mongo_client[settings.mongodb_db]

    # Ensure indices are created
    await _create_indexes()


async def close_mongo_connection() -> None:
    """
    Close MongoDB connection.
    """
    global _mongo_client, _mongo_db

    if _mongo_client is not None:
        _mongo_client.close()

    _mongo_client = None
    _mongo_db = None


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the MongoDB database instance.
    """
    if _mongo_db is None:
        raise RuntimeError("MongoDB is not initialized")
    return _mongo_db


async def _create_indexes() -> None:
    """
    Create MongoDB indexes required by the application.
    """
    db = get_database()

    await db["datasets"].create_index("uploaded_at")
    await db["datasets"].create_index("status")

    await db["column_profiles"].create_index([("dataset_id", 1), ("column_name", 1)])

    await db["audit_reports"].create_index("dataset_id", unique=True)

