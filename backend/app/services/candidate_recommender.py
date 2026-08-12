"""
AI Candidate Recommendation Engine.

Combines matching, skill analysis, role compatibility, and prediction outputs
into a unified recommendation score with explainable reasons.

Configurable weights allow tuning without code changes.
"""
from app.services.matching import matching_service
from app.services.recommendation import recommendation_service
from app.services.skill_extractor import skill_extractor


class CandidateRecommender:
    def __init__(self):
        self.weights = {
            "match_score": 0.35,
            "skill_score": 0.30,
            "experience_score": 0.10,
            "role_compatibility": 0.15,
            "prediction_bonus": 0.10
        }

    def recommend(
        self,
        resume_data: dict,
        job_data: dict,
        predicted_role: str = None,
        prediction_outputs: dict = None
    ) -> dict:
        """
        Generates a unified recommendation for a candidate against a job.
        """
        # 1. Get match result from existing matching service
        match_result = matching_service.match(resume_data, job_data)

        # 2. Skill gap
        skill_gap = match_result["skill_gap"]
        skill_score = skill_gap["skill_match_percentage"]

        # 3. Role compatibility
        candidate_skills = resume_data.get("skills", [])
        job_title = job_data.get("job_title", job_data.get("title", ""))
        role_compat_score = self._calculate_role_compatibility(
            predicted_role, job_title, candidate_skills
        )

        # 4. Prediction bonus — only include if predictions are actually available
        prediction_bonus = self._calculate_prediction_bonus(prediction_outputs)

        # 5. Weighted recommendation score (0-100)
        recommendation_score = (
            match_result["match_score"] * self.weights["match_score"] +
            skill_score * self.weights["skill_score"] +
            match_result["experience_match"] * 100 * self.weights["experience_score"] +
            role_compat_score * self.weights["role_compatibility"] +
            prediction_bonus * self.weights["prediction_bonus"]
        )

        recommendation_score = round(min(100, max(0, recommendation_score)), 2)

        # 6. Generate reasons from actual features
        reasons = self._generate_reasons(
            match_result, skill_gap, role_compat_score,
            predicted_role, prediction_outputs
        )

        # 7. Label
        recommendation_label = self._get_label(recommendation_score)

        return {
            "recommendation_score": recommendation_score,
            "recommendation": recommendation_label,
            "reasons": reasons,
            "matched_skills": skill_gap["matched_skills"],
            "missing_skills": skill_gap["missing_skills"],
            "role_compatibility_score": round(role_compat_score, 2),
            "match_details": match_result,
            "prediction_outputs": prediction_outputs or {}
        }

    def _calculate_role_compatibility(self, predicted_role: str, job_title: str, candidate_skills: list) -> float:
        """Measures how well the candidate's predicted role aligns with the job."""
        if not predicted_role or not job_title:
            return 50.0  # Neutral default

        # Simple heuristic: if predicted role matches job title words
        predicted_words = set(predicted_role.lower().split())
        job_words = set(job_title.lower().split())
        overlap = predicted_words.intersection(job_words)

        if overlap:
            return min(100.0, 60.0 + len(overlap) * 20.0)

        # Fallback: use recommendation service to see if the candidate's skills
        # match the job's role profile
        recs = recommendation_service.recommend_roles(candidate_skills, top_n=5)
        for rec in recs:
            rec_words = set(rec["role"].lower().split())
            if rec_words.intersection(job_words):
                return rec["score"]

        return 30.0

    def _calculate_prediction_bonus(self, predictions: dict) -> float:
        """Only adds bonus from predictions that are legitimately available."""
        if not predictions:
            return 50.0  # Neutral when no predictions available

        bonus = 50.0
        count = 0

        interview = predictions.get("interview")
        if interview and interview.get("predicted_score") is not None:
            bonus += interview["predicted_score"] * 0.5
            count += 1

        success = predictions.get("success")
        if success and success.get("predicted_success") is not None:
            if success["predicted_success"]:
                bonus += 30
            count += 1

        if count > 0:
            return min(100, bonus)
        return 50.0

    def _generate_reasons(self, match_result, skill_gap, role_compat, predicted_role, predictions):
        """Generates explainable reasons based on actual calculated features."""
        reasons = []

        if match_result["match_score"] >= 70:
            reasons.append("High overall resume-job match score")
        elif match_result["match_score"] >= 40:
            reasons.append("Moderate resume-job match score")
        else:
            reasons.append("Low resume-job match score")

        if skill_gap["skill_match_percentage"] >= 75:
            reasons.append("Strong skill compatibility")
        elif skill_gap["skill_match_percentage"] >= 50:
            reasons.append("Moderate skill compatibility")
        elif skill_gap["missing_skills"]:
            reasons.append(f"Missing key skills: {', '.join(skill_gap['missing_skills'][:3])}")

        if match_result["text_similarity"] >= 0.3:
            reasons.append("Strong resume-job text similarity")

        if role_compat >= 70:
            reasons.append(f"Role compatibility: predicted role '{predicted_role}' aligns with job")
        elif predicted_role:
            reasons.append(f"Predicted role: {predicted_role}")

        if predictions:
            interview = predictions.get("interview")
            if interview and interview.get("predicted_score") is not None:
                score = interview["predicted_score"]
                if score >= 70:
                    reasons.append(f"Strong predicted interview performance ({score}/100)")
                else:
                    reasons.append(f"Predicted interview score: {score}/100")

            success = predictions.get("success")
            if success and success.get("predicted_success") is not None:
                if success["predicted_success"]:
                    reasons.append("Predicted as likely successful candidate")

        return reasons

    def _get_label(self, score: float) -> str:
        if score >= 80:
            return "Strong Match"
        elif score >= 60:
            return "Good Match"
        elif score >= 40:
            return "Moderate Match"
        else:
            return "Weak Match"


candidate_recommender = CandidateRecommender()
