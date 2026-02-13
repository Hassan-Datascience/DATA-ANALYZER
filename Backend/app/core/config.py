from functools import lru_cache
from typing import List
import os
from functools import lru_cache
from typing import List
from pydantic import AnyUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field### **Context & Objective**
class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    model_config = SettingsConfigDict(
    env_file=".env", 
    env_file_encoding="utf-8", 
    extra="ignore",
    case_sensitive=False 
    )

    app_name: str = "AI Data Quality Auditor"
    app_port: int = 8000

    # MongoDB (defaults to local MongoDB; can be overridden via env var MONGODB_URI)
    mongodb_uri: str = Field(alias="MONGO_URI")
    mongodb_db: str = Field(alias="MONGO_DB_NAME")
    file_storage_root: str = "data/uploads"

    # CSV processing
    csv_chunk_size: int = 100_000

    # Scoring weights
    reliability_weight_missing: float = 1.0
    reliability_weight_anomaly: float = 1.5
    reliability_weight_inconsistency: float = 1.0
    reliability_weight_duplicate: float = 0.5

    # CORS
    cors_allow_origins: List[str] = ["*"]

    # Logging
    log_level: str = "INFO"

    @field_validator("cors_allow_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    @field_validator("csv_chunk_size")
    @classmethod
    def validate_csv_chunk_size(cls, value: int) -> int:
        """
        Ensure csv_chunk_size stays within a safe, documented range.
        """
        if not 100 <= value <= 100_000:
            raise ValueError("csv_chunk_size must be between 100 and 100000")
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Cached settings instance.
    """
    return Settings()


settings = get_settings()