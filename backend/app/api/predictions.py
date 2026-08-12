from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.salary_predictor import salary_predictor
from app.services.interview_predictor import interview_predictor
from app.services.success_predictor import success_predictor

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


class SalaryRequest(BaseModel):
    role: str
    experience_years: int
    skill_count: int


class InterviewRequest(BaseModel):
    role: str
    experience_years: int
    skill_count: int


class SuccessRequest(BaseModel):
    role: str
    experience_years: int
    skill_count: int
    interview_score: Optional[float] = None


@router.post("/salary")
async def predict_salary(request: SalaryRequest):
    if not salary_predictor.available:
        raise HTTPException(
            status_code=503,
            detail="Salary prediction model not available. Train it first with train_salary_model.py"
        )
    result = salary_predictor.predict(
        role=request.role,
        experience_years=request.experience_years,
        skill_count=request.skill_count
    )
    return result


@router.post("/interview")
async def predict_interview(request: InterviewRequest):
    if not interview_predictor.available:
        raise HTTPException(
            status_code=503,
            detail="Interview prediction model not available. Train it first with train_interview_model.py"
        )
    result = interview_predictor.predict(
        role=request.role,
        experience_years=request.experience_years,
        skill_count=request.skill_count
    )
    return result


@router.post("/success")
async def predict_success(request: SuccessRequest):
    if not success_predictor.available:
        raise HTTPException(
            status_code=503,
            detail="Success prediction model not available. Train it first with train_success_model.py"
        )
    result = success_predictor.predict(
        role=request.role,
        experience_years=request.experience_years,
        skill_count=request.skill_count,
        interview_score=request.interview_score
    )
    return result
