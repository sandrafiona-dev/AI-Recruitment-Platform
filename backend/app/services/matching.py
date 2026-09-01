import re
from typing import Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class MatchingService:
    def __init__(self):
        self.weights = {
            "text_similarity": 0.50,
            "skill_match": 0.40,
            "experience_match": 0.10,
        }

    def calculate_skill_gap(
        self,
        candidate_skills: list,
        job_skills: list,
    ) -> dict[str, Any]:
        """
        Compare candidate skills against required job skills.
        """

        if not job_skills:
            return {
                "matched_skills": candidate_skills,
                "missing_skills": [],
                "skill_match_percentage": (
                    100 if candidate_skills else 0
                ),
            }

        candidate_set = {
            str(skill).lower().strip()
            for skill in candidate_skills
        }

        job_set = {
            str(skill).lower().strip()
            for skill in job_skills
        }

        matched_skills = sorted(
            job_set.intersection(candidate_set)
        )

        missing_skills = sorted(
            job_set.difference(candidate_set)
        )

        match_percentage = (
            len(matched_skills) / len(job_set) * 100
            if job_set
            else 0
        )

        return {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_percentage": round(
                match_percentage,
                2,
            ),
        }

    def calculate_text_similarity(
        self,
        resume_text: str,
        job_text: str,
    ) -> float:
        """
        Calculate TF-IDF cosine similarity between
        resume text and job description.
        """

        if not resume_text or not job_text:
            return 0.0

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        try:
            tfidf_matrix = vectorizer.fit_transform(
                [resume_text, job_text]
            )

            similarity_matrix = cosine_similarity(
                tfidf_matrix,
                tfidf_matrix,
            )

            similarity_values = similarity_matrix.tolist()

            return float(similarity_values[0][1])

        except ValueError:
            return 0.0

    def calculate_experience_match(
        self,
        resume_exp: Any,
        job_exp: str,
    ) -> float:
        """
        Compare candidate experience against the job requirement.

        Returns a score between 0.0 and 1.0.
        """

        # No job experience requirement.
        if not job_exp or job_exp.strip().lower() in {
            "",
            "not specified",
        }:
            return 1.0

        # ---------------------------------------------
        # Extract required years from job description
        # ---------------------------------------------

        job_text = job_exp

        job_match = re.search(
            r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)",
            job_text,
            re.IGNORECASE,
        )

        if not job_match:
            return 1.0

        required_years = float(job_match.group(1))

        # ---------------------------------------------
        # Extract candidate experience
        # ---------------------------------------------

        candidate_years = 0.0

        if isinstance(resume_exp, list) and resume_exp:
            try:
                candidate_years = max(
                    float(value)
                    for value in resume_exp
                )
            except (TypeError, ValueError):
                candidate_years = 0.0

        elif isinstance(resume_exp, (int, float)):
            candidate_years = float(resume_exp)

        # ---------------------------------------------
        # Calculate experience score
        # ---------------------------------------------

        if required_years <= 0:
            return 1.0

        experience_ratio = (
            candidate_years / required_years
        )

        # Candidates meeting or exceeding the requirement
        # receive full experience credit.
        return min(
            experience_ratio,
            1.0,
        )

    def get_recommendation(
        self,
        match_score: float,
    ) -> str:
        """
        Convert the overall match score into a recruiter-friendly
        recommendation.
        """

        if match_score >= 80:
            return "Strong Match"

        if match_score >= 65:
            return "Good Match"

        if match_score >= 50:
            return "Potential Match"

        return "Low Match"

    def match(
        self,
        resume_data: dict,
        job_data: dict,
    ) -> dict[str, Any]:
        """
        Calculate the overall resume-to-job match.
        """

        # ---------------------------------------------
        # 1. TEXT SIMILARITY
        # ---------------------------------------------

        resume_text = resume_data.get(
            "raw_text",
            "",
        )

        job_text = job_data.get(
            "description",
            "",
        )

        text_sim = self.calculate_text_similarity(
            resume_text,
            job_text,
        )

        # ---------------------------------------------
        # 2. SKILL MATCH
        # ---------------------------------------------

        skill_gap = self.calculate_skill_gap(
            resume_data.get("skills", []),
            job_data.get("required_skills", []),
        )

        skill_score = (
            skill_gap["skill_match_percentage"] / 100.0
        )

        # ---------------------------------------------
        # 3. EXPERIENCE MATCH
        # ---------------------------------------------

        exp_score = self.calculate_experience_match(
            resume_data.get("experience", ""),
            job_data.get("experience", ""),
        )

        # ---------------------------------------------
        # 4. OVERALL MATCH
        # ---------------------------------------------

        match_score = (
            (
                text_sim
                * self.weights["text_similarity"]
            )
            + (
                skill_score
                * self.weights["skill_match"]
            )
            + (
                exp_score
                * self.weights["experience_match"]
            )
        ) * 100

        match_score = round(match_score, 2)

        # ---------------------------------------------
        # 5. RECOMMENDATION
        # ---------------------------------------------

        recommendation = self.get_recommendation(
            match_score
        )

        # ---------------------------------------------
        # 6. RESULT
        # ---------------------------------------------

        return {
            "match_score": match_score,
            "text_similarity": round(text_sim, 2),
            "skill_match": round(skill_score, 2),
            "experience_match": round(exp_score, 2),
            "skill_gap": skill_gap,
            "recommendation": recommendation,
        }


matching_service = MatchingService()