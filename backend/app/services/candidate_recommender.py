"""
AI Candidate Recommendation Engine.

Combines:
- Resume-job matching
- Skill compatibility
- Experience compatibility
- Role compatibility
- Prediction outputs

The recommendation system considers both the ML-predicted role
and the candidate's skills when evaluating compatibility with a job.
"""

from app.services.matching import matching_service
from app.services.recommendation import recommendation_service


class CandidateRecommender:

    def __init__(self):
        self.weights = {
            "match_score": 0.35,
            "skill_score": 0.30,
            "experience_score": 0.10,
            "role_compatibility": 0.15,
            "prediction_bonus": 0.10,
        }

    def recommend(
        self,
        resume_data: dict,
        job_data: dict,
        predicted_role: str = None,
        prediction_outputs: dict = None,
    ) -> dict:

        # -------------------------------------------------
        # 1. Resume-to-job matching
        # -------------------------------------------------
        match_result = matching_service.match(
            resume_data,
            job_data
        )

        # -------------------------------------------------
        # 2. Skill gap
        # -------------------------------------------------
        skill_gap = match_result["skill_gap"]
        skill_score = skill_gap["skill_match_percentage"]

        # -------------------------------------------------
        # 3. Role compatibility
        # -------------------------------------------------
        candidate_skills = resume_data.get("skills", [])

        job_title = (
            job_data.get("job_title")
            or job_data.get("title")
            or ""
        )

        role_compat_score = self._calculate_role_compatibility(
            predicted_role=predicted_role,
            job_title=job_title,
            candidate_skills=candidate_skills,
            job_skills=skill_gap.get("matched_skills", []),
            required_skills=job_data.get("required_skills", []),
        )

        # -------------------------------------------------
        # 4. Prediction bonus
        # -------------------------------------------------
        prediction_bonus = self._calculate_prediction_bonus(
            prediction_outputs
        )

        # -------------------------------------------------
        # 5. Weighted recommendation score
        # -------------------------------------------------
        recommendation_score = (
            match_result["match_score"]
            * self.weights["match_score"]
            +
            skill_score
            * self.weights["skill_score"]
            +
            match_result["experience_match"]
            * 100
            * self.weights["experience_score"]
            +
            role_compat_score
            * self.weights["role_compatibility"]
            +
            prediction_bonus
            * self.weights["prediction_bonus"]
        )

        recommendation_score = round(
            min(100, max(0, recommendation_score)),
            2,
        )

        # -------------------------------------------------
        # 6. Reasons
        # -------------------------------------------------
        reasons = self._generate_reasons(
            match_result=match_result,
            skill_gap=skill_gap,
            role_compat=role_compat_score,
            predicted_role=predicted_role,
            job_title=job_title,
            predictions=prediction_outputs,
        )

        # -------------------------------------------------
        # 7. Recommendation label
        # -------------------------------------------------
        recommendation_label = self._get_label(
            recommendation_score
        )

        return {
            "recommendation_score": recommendation_score,
            "recommendation": recommendation_label,
            "reasons": reasons,
            "matched_skills": skill_gap["matched_skills"],
            "missing_skills": skill_gap["missing_skills"],
            "role_compatibility_score": round(
                role_compat_score,
                2,
            ),
            "match_details": match_result,
            "prediction_outputs": prediction_outputs or {},
        }

    # =====================================================
    # ROLE COMPATIBILITY
    # =====================================================

    def _calculate_role_compatibility(
        self,
        predicted_role: str,
        job_title: str,
        candidate_skills: list,
        job_skills: list,
        required_skills: list,
    ) -> float:
        """
        Calculates compatibility between the candidate and job.

        The calculation considers:

        1. Direct predicted-role match
        2. Candidate skills relevant to the job
        3. Recommended-role similarity
        """

        if not job_title:
            return 50.0

        predicted_role = (predicted_role or "").lower().strip()
        job_title = job_title.lower().strip()

        # Normalize skills
        candidate_skill_set = {
            str(skill).lower().strip()
            for skill in candidate_skills
        }

        required_skill_set = {
            str(skill).lower().strip()
            for skill in required_skills
        }

        # -------------------------------------------------
        # A. Direct predicted-role match
        # -------------------------------------------------
        predicted_words = set(predicted_role.split())
        job_words = set(job_title.split())

        direct_overlap = predicted_words.intersection(
            job_words
        )

        if direct_overlap:
            return 100.0

        # -------------------------------------------------
        # B. Skill-based compatibility
        # -------------------------------------------------
        if required_skill_set:

            matched_required = (
                candidate_skill_set
                .intersection(required_skill_set)
            )

            skill_ratio = (
                len(matched_required)
                / len(required_skill_set)
            )

            skill_based_score = skill_ratio * 100

        else:
            skill_based_score = 50.0

        # -------------------------------------------------
        # C. Recommendation-service role compatibility
        # -------------------------------------------------
        recommended_roles = (
            recommendation_service.recommend_roles(
                list(candidate_skill_set),
                top_n=5,
            )
        )

        recommendation_score = 0.0

        for rec in recommended_roles:

            rec_role = str(
                rec.get("role", "")
            ).lower().strip()

            rec_words = set(rec_role.split())

            if rec_words.intersection(job_words):

                recommendation_score = max(
                    recommendation_score,
                    float(rec.get("score", 0)),
                )

        # -------------------------------------------------
        # D. Combine skill and role evidence
        # -------------------------------------------------
        if recommendation_score > 0:

            combined_score = (
                skill_based_score * 0.60
                + recommendation_score * 0.40
            )

        else:

            combined_score = skill_based_score

        # -------------------------------------------------
        # E. Minimum sensible compatibility
        # -------------------------------------------------
        return round(
            min(100.0, max(0.0, combined_score)),
            2,
        )

    # =====================================================
    # PREDICTION BONUS
    # =====================================================

    def _calculate_prediction_bonus(
        self,
        predictions: dict,
    ) -> float:

        if not predictions:
            return 50.0

        bonus = 50.0
        count = 0

        interview = predictions.get("interview")

        if (
            interview
            and interview.get("predicted_score") is not None
        ):
            bonus += (
                interview["predicted_score"] * 0.5
            )
            count += 1

        success = predictions.get("success")

        if (
            success
            and success.get("predicted_success") is not None
        ):
            if success["predicted_success"]:
                bonus += 30

            count += 1

        if count > 0:
            return min(100.0, bonus)

        return 50.0

    # =====================================================
    # REASONS
    # =====================================================

    def _generate_reasons(
        self,
        match_result,
        skill_gap,
        role_compat,
        predicted_role,
        job_title,
        predictions,
    ):

        reasons = []

        # Overall match
        if match_result["match_score"] >= 70:
            reasons.append(
                "High overall resume-job match score"
            )

        elif match_result["match_score"] >= 40:
            reasons.append(
                "Moderate resume-job match score"
            )

        else:
            reasons.append(
                "Low resume-job match score"
            )

        # Skill compatibility
        if skill_gap["skill_match_percentage"] >= 75:

            reasons.append(
                "Strong skill compatibility"
            )

        elif skill_gap["skill_match_percentage"] >= 50:

            reasons.append(
                "Moderate skill compatibility"
            )

        elif skill_gap["missing_skills"]:

            reasons.append(
                "Missing key skills: "
                + ", ".join(
                    skill_gap["missing_skills"][:3]
                )
            )

        # Text similarity
        if match_result["text_similarity"] >= 0.3:

            reasons.append(
                "Strong resume-job text similarity"
            )

        # Role compatibility
        if role_compat >= 70:

            reasons.append(
                f"Strong compatibility with {job_title} role"
            )

        elif role_compat >= 50:

            reasons.append(
                f"Moderate compatibility with {job_title} role"
            )

        elif predicted_role:

            reasons.append(
                f"Predicted role: {predicted_role}"
            )

        # Interview prediction
        if predictions:

            interview = predictions.get(
                "interview"
            )

            if (
                interview
                and interview.get("predicted_score")
                is not None
            ):

                score = interview[
                    "predicted_score"
                ]

                if score >= 70:

                    reasons.append(
                        "Strong predicted interview "
                        f"performance ({score}/100)"
                    )

                else:

                    reasons.append(
                        f"Predicted interview score: "
                        f"{score}/100"
                    )

            # Success prediction
            success = predictions.get(
                "success"
            )

            if (
                success
                and success.get("predicted_success")
                is not None
            ):

                if success["predicted_success"]:

                    reasons.append(
                        "Predicted as likely successful candidate"
                    )

        return reasons

    # =====================================================
    # LABEL
    # =====================================================

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