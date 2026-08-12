"""
Unified Candidate Analysis Orchestration Service.

Combines all existing modules (parsing, classification, matching, skill extraction,
job parsing, recommendation, predictions) into a single analysis pipeline.

Keeps orchestration separate from individual ML services.
"""
from app.services.parser import ResumeParser
from app.services.classifier import ResumeClassifier
from app.services.job_parser import job_parser
from app.services.skill_extractor import skill_extractor
from app.services.recommendation import recommendation_service
from app.services.candidate_recommender import candidate_recommender
from app.services.salary_predictor import salary_predictor
from app.services.interview_predictor import interview_predictor
from app.services.success_predictor import success_predictor


class CandidateAnalysisService:
    def __init__(self):
        self.resume_parser = ResumeParser()
        self.classifier = ResumeClassifier()

    def analyze(self, resume_bytes: bytes, filename: str, job_description: str) -> dict:
        """
        Full candidate analysis pipeline:
        1. Parse resume
        2. Classify role
        3. Parse job description
        4. Match resume to job
        5. Extract skills & compute gap
        6. Get role recommendations
        7. Run available predictions
        8. Generate unified recommendation
        """
        # 1. Parse resume
        parsed_resume = self.resume_parser.parse(resume_bytes, filename)

        # 2. Classify role
        predicted_role = self.classifier.predict(parsed_resume["raw_text"])
        parsed_resume["predicted_role"] = predicted_role

        # 3. Parse job description
        parsed_job = job_parser.parse(job_description)

        # 4. Categorize skills
        categorized = skill_extractor.categorize_skills(parsed_resume["skills"])

        # 5. Role recommendations
        recommended_roles = recommendation_service.recommend_roles(parsed_resume["skills"], top_n=5)

        # 6. Predictions (only if models are available)
        skill_count = len(parsed_resume["skills"])
        # Experience defaults to 0 since we can't reliably extract it from parsed text yet
        experience_years = 0

        predictions = {}

        if salary_predictor.available:
            predictions["salary"] = salary_predictor.predict(
                role=predicted_role,
                experience_years=experience_years,
                skill_count=skill_count
            )

        if interview_predictor.available:
            predictions["interview"] = interview_predictor.predict(
                role=predicted_role,
                experience_years=experience_years,
                skill_count=skill_count
            )

        if success_predictor.available:
            interview_score = None
            if "interview" in predictions and predictions["interview"].get("predicted_score"):
                interview_score = predictions["interview"]["predicted_score"]
            predictions["success"] = success_predictor.predict(
                role=predicted_role,
                experience_years=experience_years,
                skill_count=skill_count,
                interview_score=interview_score
            )

        # 7. Unified recommendation
        recommendation = candidate_recommender.recommend(
            resume_data=parsed_resume,
            job_data=parsed_job,
            predicted_role=predicted_role,
            prediction_outputs=predictions
        )

        return {
            "candidate": {
                "name": parsed_resume["name"],
                "email": parsed_resume["email"],
                "phone": parsed_resume["phone"],
                "skills": parsed_resume["skills"],
                "skills_categorized": categorized,
                "education": parsed_resume["education"],
                "experience": parsed_resume["experience"],
            },
            "predicted_role": predicted_role,
            "job_analysis": {
                "job_title": parsed_job["job_title"],
                "required_skills": parsed_job["required_skills"],
                "experience": parsed_job["experience"],
                "education": parsed_job["education"]
            },
            "match_score": recommendation["match_details"]["match_score"],
            "skill_gap": recommendation["match_details"]["skill_gap"],
            "recommended_roles": recommended_roles,
            "recommendation": {
                "score": recommendation["recommendation_score"],
                "label": recommendation["recommendation"],
                "reasons": recommendation["reasons"],
                "matched_skills": recommendation["matched_skills"],
                "missing_skills": recommendation["missing_skills"],
                "role_compatibility": recommendation["role_compatibility_score"]
            },
            "predictions": predictions
        }


candidate_analysis_service = CandidateAnalysisService()
