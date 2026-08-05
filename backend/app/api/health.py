"""Health-check endpoint."""

from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Report that the API is available."""
    return {"status": "healthy"}
