"""FastAPI application entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.core.config import settings
from app.core.logging import configure_logging


configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)

logger.info("Starting %s in %s environment", settings.app_name, settings.app_env)


@app.get("/")
async def read_root() -> dict[str, str]:
    """Return a welcome message for the API."""
    return {"message": "Welcome to AI Recruitment Platform API"}
