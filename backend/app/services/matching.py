from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class MatchingService:
    def __init__(self):
        # Configurable baseline weights
        self.weights = {
            "text_similarity": 0.50,
            "skill_match": 0.40,
            "experience_match": 0.10
        }
        
    def calculate_skill_gap(self, candidate_skills: list, job_skills: list) -> dict:
        """
        Compare candidate skills vs required job skills.
        """
        if not job_skills:
            return {
                "matched_skills": candidate_skills,
                "missing_skills": [],
                "skill_match_percentage": 100 if candidate_skills else 0
            }
            
        candidate_set = set(s.lower() for s in candidate_skills)
        job_set = set(s.lower() for s in job_skills)
        
        matched_skills = list(job_set.intersection(candidate_set))
        missing_skills = list(job_set.difference(candidate_set))
        
        match_percentage = (len(matched_skills) / len(job_set)) * 100 if job_set else 0
        
        return {
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_percentage": round(match_percentage, 2)
        }
        
    def calculate_text_similarity(self, resume_text: str, job_text: str) -> float:
        """
        Calculate TF-IDF cosine similarity between resume and job text.
        """
        if not resume_text or not job_text:
            return 0.0
            
        vectorizer = TfidfVectorizer(stop_words='english')
        try:
            tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except ValueError:
            # Vocabulary empty
            return 0.0
            
    def calculate_experience_match(self, resume_exp: list, job_exp: str) -> float:
        """
        Mock experience matching for MVP. 
        In a real scenario, we'd extract years of experience and compare them.
        """
        # We don't have robust experience parsing yet, so default to 0.7 
        # unless job doesn't specify experience.
        if job_exp == "Not specified":
            return 1.0
        return 0.7
        
    def match(self, resume_data: dict, job_data: dict) -> dict:
        """
        Calculate overall match score between a parsed resume and parsed job description.
        """
        text_sim = self.calculate_text_similarity(resume_data.get("raw_text", ""), job_data.get("description", ""))
        
        skill_gap = self.calculate_skill_gap(
            resume_data.get("skills", []), 
            job_data.get("required_skills", [])
        )
        skill_score = skill_gap["skill_match_percentage"] / 100.0
        
        exp_score = self.calculate_experience_match(
            resume_data.get("experience", []), 
            job_data.get("experience", "")
        )
        
        # Weighted sum normalized to 0-100
        match_score = (
            (text_sim * self.weights["text_similarity"]) +
            (skill_score * self.weights["skill_match"]) +
            (exp_score * self.weights["experience_match"])
        ) * 100
        
        return {
            "match_score": round(match_score, 2),
            "text_similarity": round(text_sim, 2),
            "skill_match": round(skill_score, 2),
            "experience_match": round(exp_score, 2),
            "skill_gap": skill_gap
        }

matching_service = MatchingService()
