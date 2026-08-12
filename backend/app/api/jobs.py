from httpx import request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.services.job_parser import job_parser
from app.services.recommendation import recommendation_service

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])

class JobParseRequest(BaseModel):
    description: str
    job_title: str = ""
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    experience: str = ""
    education: str = ""

class JobParseResponse(BaseModel):
    job_title: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience: str
    education: str
    description: str

class RecommendRequest(BaseModel):
    skills: List[str]

@router.post("/parse", response_model=JobParseResponse)
async def parse_job(request: JobParseRequest):
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")
        
    try:
        parsed_data = job_parser.parse(request.description)
        if request.job_title:
            parsed_data["job_title"] = request.job_title

        if request.required_skills:
            parsed_data["required_skills"] = request.required_skills

        if request.preferred_skills:
            parsed_data["preferred_skills"] = request.preferred_skills

        if request.experience:
            parsed_data["experience"] = request.experience

        if request.education:
            parsed_data["education"] = request.education

        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
async def recommend_jobs(request: RecommendRequest):
    try:
        recommendations = recommendation_service.recommend_roles(request.skills)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
