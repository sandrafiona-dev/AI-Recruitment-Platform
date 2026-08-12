"""FastAPI application entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.matching import router as matching_router
from app.api.candidates import router as candidates_router
from app.api.predictions import router as predictions_router
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
app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(matching_router)
app.include_router(candidates_router)
app.include_router(predictions_router)

logger.info("Starting %s in %s environment", settings.app_name, settings.app_env)


@app.get("/")
async def read_root() -> dict[str, str]:
    """Return a welcome message for the API."""
    return {"message": "Welcome to AI Recruitment Platform API"}
