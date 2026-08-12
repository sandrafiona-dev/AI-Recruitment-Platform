import os
import joblib
import numpy as np
import pandas as pd

from backend.app.services.matching import matching_service
from backend.app.services.skill_extractor import skill_extractor


class CandidateRecommendationService:

    def __init__(self):
        base_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__))
                )
            )
        )

        model_dir = os.path.join(base_dir, "ml", "models")

        self.salary_model = self._load_model(
            os.path.join(model_dir, "salary_predictor.pkl")
        )
        self.salary_encoder = self._load_model(
            os.path.join(model_dir, "salary_label_encoder.pkl")
        )

        self.interview_model = self._load_model(
            os.path.join(model_dir, "interview_predictor.pkl")
        )
        self.interview_encoder = self._load_model(
            os.path.join(model_dir, "interview_label_encoder.pkl")
        )

        self.success_model = self._load_model(
            os.path.join(model_dir, "success_predictor.pkl")
        )
        self.success_encoder = self._load_model(
            os.path.join(model_dir, "success_label_encoder.pkl")
        )

    @staticmethod
    def _load_model(path):
        if not os.path.exists(path):
            return None

        try:
            return joblib.load(path)
        except Exception:
            return None

    def _encode_role(self, role, encoder):
        if not role or encoder is None:
            return 0

        try:
            return int(encoder.transform([role])[0])
        except ValueError:
            return 0

    def predict_interview(self, role, experience_years, skill_count):
        if self.interview_model is None:
            return None
        role_encoded = self._encode_role(
            role,
            self.interview_encoder
        )

        features = pd.DataFrame(
            [[
                role_encoded,
                float(experience_years),
                int(skill_count)
             ]],
            columns=[
                "role_encoded",
                "experience_years",
                "skill_count"
            ]
        )

        prediction = self.interview_model.predict(features)[0]

        return round(float(np.clip(prediction, 0, 100)), 2)
    
    def predict_success(
        self,
        role,
        experience_years,
            skill_count,
        interview_score
    ):
        if self.success_model is None:
            return None

        role_encoded = self._encode_role(
            role,
            self.success_encoder
        )

        features = pd.DataFrame(
            [[
                role_encoded,
                float(experience_years),
                int(skill_count),
                float(interview_score)
            ]],
            columns=[
                "role_encoded",
                "experience_years",
                "skill_count",
                "interview_score"
            ]
        )

        probability = self.success_model.predict_proba(features)[0][1]

        return round(float(probability * 100), 2)
        
    def predict_salary(self, role, experience_years, skill_count):
        if self.salary_model is None:
            return None

        role_encoded = self._encode_role(
            role,
            self.salary_encoder
        )

        features = pd.DataFrame(
            [[
                role_encoded,
                float(experience_years),
                int(skill_count)
            ]],
            columns=[
                "role_encoded",
                "experience_years",
                "skill_count"
            ]
        )

        prediction = self.salary_model.predict(features)[0]

        return round(max(float(prediction), 0), 2)

    def recommend_candidate(self, candidate, job):
        resume_text = candidate.get("raw_text", "")
        candidate_skills = candidate.get("skills", [])

        if not candidate_skills and resume_text:
            candidate_skills = skill_extractor.extract_skills(
                resume_text
            )

        match_result = matching_service.match(
            {
                **candidate,
                "raw_text": resume_text,
                "skills": candidate_skills
            },
            job
        )

        role = candidate.get(
            "role",
            job.get("title", "")
        )

        experience = candidate.get(
            "experience_years",
            0
        )

        skill_count = len(candidate_skills)

        interview_score = self.predict_interview(
            role,
            experience,
            skill_count
        )

        success_probability = None

        if interview_score is not None:
            success_probability = self.predict_success(
                role,
                experience,
                skill_count,
                interview_score
            )

        salary = self.predict_salary(
            role,
            experience,
            len(candidate.get("skills", []))
        )

        match_score = match_result["match_score"]

        skill_score = match_result["skill_match"] * 100

        experience_score = match_result["experience_match"] * 100

        interview_component = (
            interview_score
            if interview_score is not None
            else 0
        )

        success_component = (
            success_probability
            if success_probability is not None
            else 0
        )

        recommendation_score = (
            match_score * 0.50
            + skill_score * 0.20
            + experience_score * 0.10
            + interview_component * 0.10
            + success_component * 0.10
        )

        return {
            "candidate_id": candidate.get(
                "id",
                candidate.get("email", "Unknown")
            ),
            "name": candidate.get("name", "Unknown"),
            "match_score": round(match_score, 2),
            "skill_match": round(skill_score, 2),
            "experience_match": round(experience_score, 2),
            "predicted_interview_score": interview_score,
            "success_probability": success_probability,
            "predicted_salary": salary,
            "recommendation_score": round(
                recommendation_score,
                2
            ),
            "skill_gap": match_result.get(
                "skill_gap",
                {}
            )
        }


candidate_recommendation_service = CandidateRecommendationService()