class RecommendationService:
    def __init__(self):
        # Configurable role profiles
        self.role_profiles = {
            "Python Developer": ["python", "django", "flask", "fastapi", "sql", "git"],
            "Data Analyst": ["python", "sql", "pandas", "numpy", "data analysis", "statistics"],
            "Data Scientist": ["python", "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "sql"],
            "Machine Learning Engineer": ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "docker", "kubernetes"],
            "Full Stack Developer": ["javascript", "react", "node.js", "html", "css", "sql", "git", "python", "java"],
            "Backend Developer": ["java", "python", "node.js", "c#", "sql", "postgresql", "mysql", "docker", "api"],
            "Frontend Developer": ["javascript", "react", "angular", "vue", "html", "css", "typescript"],
            "Cybersecurity Analyst": ["cybersecurity", "network security", "penetration testing", "firewalls", "siem"],
            "DevOps Engineer": ["aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "terraform", "ansible", "python"]
        }
        
    def recommend_roles(self, candidate_skills: list, top_n: int = 3) -> list:
        """
        Calculates compatibility between candidate skills and known role profiles.
        Returns top recommended roles.
        """
        if not candidate_skills:
            return []
            
        candidate_set = set(s.lower() for s in candidate_skills)
        recommendations = []
        
        for role, required_skills in self.role_profiles.items():
            req_set = set(s.lower() for s in required_skills)
            overlap = candidate_set.intersection(req_set)
            
            if not req_set:
                score = 0
            else:
                score = (len(overlap) / len(req_set)) * 100
                
            if score > 0:
                recommendations.append({
                    "role": role,
                    "score": round(score, 2)
                })
                
        # Sort by score descending
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        return recommendations[:top_n]

recommendation_service = RecommendationService()
