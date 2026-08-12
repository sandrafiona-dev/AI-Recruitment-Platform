from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.matching import matching_service

router = APIRouter(prefix="/api/v1/matching", tags=["matching"])

class MatchRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_data: Dict[str, Any]

class SkillGapRequest(BaseModel):
    candidate_skills: List[str]
    required_skills: List[str]

@router.post("/match")
async def match_resume_to_job(request: MatchRequest):
    try:
        result = matching_service.match(request.resume_data, request.job_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-gap")
async def calculate_skill_gap(request: SkillGapRequest):
    try:
        result = matching_service.calculate_skill_gap(request.candidate_skills, request.required_skills)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
