from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any

from app.services.ranking import ranking_service
from app.services.candidate_recommender import candidate_recommender
from app.services.candidate_analysis import candidate_analysis_service
from app.services.interview_predictor import interview_predictor
from app.services.success_predictor import success_predictor
from app.services.salary_predictor import salary_predictor

router = APIRouter(prefix="/api/v1/candidates", tags=["candidates"])

class RankRequest(BaseModel):
    candidates: List[Dict[str, Any]]
    job_data: Dict[str, Any]

class RecommendRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_data: Dict[str, Any]
    predicted_role: str = ""
    prediction_outputs: Dict[str, Any] = {}

@router.post("/rank")
async def rank_candidates(request: RankRequest):
    try:
        ranked = ranking_service.rank_candidates(request.candidates, request.job_data)
        return ranked
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend")
async def recommend_candidate(request: RecommendRequest):
    try:
        resume = request.resume_data

        # Use predicted role, or fall back to candidate role
        role = (
            request.predicted_role
            or resume.get("predicted_role")
            or resume.get("role")
            or "Software Engineer"
        )

        # Get experience
        experience = resume.get("experience_years", 1)

        try:
            experience = int(float(experience))
        except (ValueError, TypeError):
            experience = 1

        # Count candidate skills
        skills = resume.get("skills", [])
        skill_count = len(skills)

        # -------------------------------------------------
        # 1. Interview prediction
        # -------------------------------------------------
        interview_output = None

        if interview_predictor.available:
            interview_output = interview_predictor.predict(
                role=role,
                experience_years=experience,
                skill_count=skill_count
            )

        # -------------------------------------------------
        # 2. Success prediction
        # -------------------------------------------------
        success_output = None

        if success_predictor.available:
            interview_score = None

            if interview_output:
                interview_score = interview_output.get("predicted_score")

            success_output = success_predictor.predict(
                role=role,
                experience_years=experience,
                skill_count=skill_count,
                interview_score=interview_score
            )

        # -------------------------------------------------
        # 3. Salary prediction
        # -------------------------------------------------
        salary_output = None

        if salary_predictor.available:
            salary_output = salary_predictor.predict(
                role=role,
                experience_years=experience,
                skill_count=skill_count
            )

        # -------------------------------------------------
        # Combine predictions
        # -------------------------------------------------
        prediction_outputs = {
            "interview": interview_output,
            "success": success_output,
            "salary": salary_output
        }

        # -------------------------------------------------
        # Candidate recommendation
        # -------------------------------------------------
        result = candidate_recommender.recommend(
            resume_data=request.resume_data,
            job_data=request.job_data,
            predicted_role=role,
            prediction_outputs=prediction_outputs
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_candidate(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Use .pdf, .docx, or .txt")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    try:
        contents = await file.read()
        result = candidate_analysis_service.analyze(contents, file.filename, job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
