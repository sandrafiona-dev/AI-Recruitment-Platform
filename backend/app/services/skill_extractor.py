import re

class SkillExtractor:
    def __init__(self):
        # Centralized skill vocabulary categorized
        self.skill_categories = {
            "Programming": ["python", "java", "javascript", "c", "c++", "c#", "php", "sql", "typescript", "ruby", "go", "rust"],
            "Web": ["html", "css", "react", "angular", "node.js", "django", "flask", "fastapi", "vue", "spring boot"],
            "Data/AI": ["machine learning", "deep learning", "nlp", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "data analysis", "statistics"],
            "Cloud/DevOps": ["aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "gitlab", "ci/cd", "jenkins", "terraform", "ansible"],
            "Database": ["mysql", "postgresql", "mongodb", "sqlite", "oracle", "redis", "cassandra"],
            "Cybersecurity": ["cybersecurity", "network security", "penetration testing", "siem", "iam", "cryptography", "vulnerability assessment", "firewalls"]
        }
        
        # Flatten skills and map back to categories for easy lookup
        self.skill_to_category = {}
        for category, skills in self.skill_categories.items():
            for skill in skills:
                self.skill_to_category[skill] = category
                
        # All known skills for fast extraction
        self.all_skills = set(self.skill_to_category.keys())

    def extract_skills(self, text: str) -> list:
        """
        Extracts known skills from the given text.
        Returns a deduplicated list of standardized skill names.
        """
        if not text:
            return []
            
        text_lower = text.lower()
        
        # We use a simple word-boundary regex to prevent partial matches like 'c' in 'cat'
        # Since some skills have spaces or special chars (e.g. c++, node.js), we iterate through our known skills.
        extracted = set()
        for skill in self.all_skills:
            # Escape skill for regex to handle c++, node.js etc.
            pattern = r'\b' + re.escape(skill) + r'(?:\b|$)'
            # Special case for C, C++, C# to ensure word boundaries work correctly around punctuation
            if skill in ["c++", "c#"]:
                pattern = r'\b' + re.escape(skill) + r'(?:\s|$)'
            elif skill == "c":
                pattern = r'\bc\b'
                
            if re.search(pattern, text_lower):
                extracted.add(skill)
                
        # Also just do a simple substring check as fallback for multi-word skills
        for skill in self.all_skills:
            if skill not in extracted and len(skill) > 2 and skill in text_lower:
                extracted.add(skill)
                
        return list(extracted)
        
    def categorize_skills(self, skills: list) -> dict:
        """
        Groups a list of skills by their category.
        """
        categorized = {}
        for skill in skills:
            skill_lower = skill.lower()
            cat = self.skill_to_category.get(skill_lower, "Other")
            if cat not in categorized:
                categorized[cat] = []
            categorized[cat].append(skill)
        return categorized

# Singleton instance
skill_extractor = SkillExtractor()
