"""Application settings loaded from environment variables."""

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")


def _as_bool(value: str) -> bool:
    """Convert a common environment-variable boolean value."""
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _cors_origins(value: str) -> list[str]:
    """Parse a comma-separated list of allowed CORS origins."""
    return [origin.strip() for origin in value.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the API service."""

    app_name: str
    app_env: str
    debug: bool
    cors_origins: list[str]
    log_level: str


settings = Settings(
    app_name=os.getenv("APP_NAME", "AI Recruitment Platform API"),
    app_env=os.getenv("APP_ENV", "development"),
    debug=_as_bool(os.getenv("DEBUG", "false")),
    cors_origins=_cors_origins(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    ),
    log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
)
