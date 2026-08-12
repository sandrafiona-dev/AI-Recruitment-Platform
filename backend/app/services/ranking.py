from app.services.matching import matching_service

class RankingService:
    def rank_candidates(self, candidates: list, job_data: dict) -> list:
        """
        Ranks a list of candidate parsed resumes against a job description.
        Returns a sorted list of candidates with their scores.
        """
        ranked_candidates = []
        for candidate in candidates:
            # We assume candidate is a parsed resume dict
            match_result = matching_service.match(candidate, job_data)
            
            ranked_candidates.append({
                "candidate_id": candidate.get("id", candidate.get("email", "Unknown")),
                "name": candidate.get("name", "Unknown"),
                "match_score": match_result["match_score"],
                "details": match_result
            })
            
        # Sort descending by match_score
        ranked_candidates.sort(key=lambda x: x["match_score"], reverse=True)
        return ranked_candidates

ranking_service = RankingService()
