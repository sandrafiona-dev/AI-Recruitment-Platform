import re
from app.services.skill_extractor import skill_extractor

class JobParser:
    def parse(self, text: str) -> dict:
        """
        Parses a job description to extract title, skills, experience, and education.
        """
        if not text:
            return {
                "job_title": "",
                "required_skills": [],
                "preferred_skills": [],
                "experience": "",
                "education": "",
                "description": ""
            }
            
        return {
            "job_title": self.extract_job_title(text),
            "required_skills": self.extract_required_skills(text),
            "preferred_skills": self.extract_preferred_skills(text),
            "experience": self.extract_experience(text),
            "education": self.extract_education(text),
            "description": text.strip()
        }
        
    def extract_job_title(self, text: str) -> str:
        # Simple heuristic: Look for the first line or a "Title:" prefix
        lines = text.strip().split('\n')
        for line in lines[:5]:
            if "title:" in line.lower():
                return line.split(':', 1)[1].strip()
        if lines:
            return lines[0][:100].strip()
        return "Unknown"
        
    def extract_required_skills(self, text: str) -> list:
        # In a real app, this would use NLP to differentiate required vs preferred.
        # For MVP, we extract all skills found in the text.
        return skill_extractor.extract_skills(text)
        
    def extract_preferred_skills(self, text: str) -> list:
        # Placeholder for MVP. Could look for "nice to have" or "preferred" sections.
        return []
        
    def extract_experience(self, text: str) -> str:
        # Look for years of experience
        exp_pattern = r'(\d+\+?\s*(?:to|-)?\s*\d*\+?\s*years?.*?experience)'
        match = re.search(exp_pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
        return "Not specified"
        
    def extract_education(self, text: str) -> str:
        # Look for degree mentions
        edu_keywords = ["bachelor", "master", "phd", "degree", "bs", "ms", "b.s.", "m.s."]
        for keyword in edu_keywords:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                return f"Requires {keyword.title()}"
        return "Not specified"

job_parser = JobParser()
