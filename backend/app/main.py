"""FastAPI application entry point."""

import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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


# React production build.
# FastAPI serves the frontend so the entire application uses ONE URL.
FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"


if FRONTEND_DIST.exists():
    assets_dir = FRONTEND_DIST / "assets"

    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=assets_dir),
            name="assets",
        )


@app.get("/")
async def read_root():
    """Serve the React application."""
    if FRONTEND_INDEX.is_file():
        return FileResponse(FRONTEND_INDEX)

    return {
        "message": "Welcome to AI Recruitment Platform API"
    }


@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve React routes and support browser refreshes."""

    if FRONTEND_INDEX.is_file():
        requested_file = (FRONTEND_DIST / full_path).resolve()
        frontend_root = FRONTEND_DIST.resolve()

        if (
            requested_file.is_relative_to(frontend_root)
            and requested_file.is_file()
        ):
            return FileResponse(requested_file)

        return FileResponse(FRONTEND_INDEX)

    return {
        "message": "Welcome to AI Recruitment Platform API"
    }


logger.info(
    "Starting %s in %s environment",
    settings.app_name,
    settings.app_env,
)
