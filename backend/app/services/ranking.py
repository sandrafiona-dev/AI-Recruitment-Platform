from typing import Any

from app.services.matching import matching_service


class RankingService:
    """
    Ranks multiple candidates against a job.

    Candidate-job scoring is handled by MatchingService.
    Candidates are then sorted from highest to lowest score.
    """

    def rank_candidates(
        self,
        candidates: list,
        job_data: dict,
    ) -> list:
        """
        Rank parsed candidate resumes against a parsed job.

        Returns candidates sorted from highest to lowest
        match score with a transparent score breakdown.
        """

        ranked_candidates = []

        for candidate in candidates:
            match_result = matching_service.match(
                candidate,
                job_data,
            )

            ranked_candidates.append(
                {
                    "candidate_id": candidate.get(
                        "id",
                        candidate.get(
                            "email",
                            "Unknown",
                        ),
                    ),
                    "name": candidate.get(
                        "name",
                        "Unknown",
                    ),
                    "match_score": match_result[
                        "match_score"
                    ],
                    "recommendation": match_result[
                        "recommendation"
                    ],
                    "score_breakdown": {
                        "text_similarity": match_result[
                            "text_similarity"
                        ],
                        "skill_match": match_result[
                            "skill_match"
                        ],
                        "experience_match": match_result[
                            "experience_match"
                        ],
                    },
                    "skill_gap": match_result[
                        "skill_gap"
                    ],
                    "details": match_result,
                    "status": "New",
                }
            )

        # Highest score first.
        ranked_candidates.sort(
            key=lambda candidate: candidate[
                "match_score"
            ],
            reverse=True,
        )

        # Add explicit ranking position.
        for index, candidate in enumerate(
            ranked_candidates,
            start=1,
        ):
            candidate["rank"] = index

        return ranked_candidates


ranking_service = RankingService()