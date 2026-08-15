import re
from app.services.skill_extractor import skill_extractor


class JobParser:
    def parse(self, text: str) -> dict:
        """
        Parses a job description to extract:
        - Job title
        - Required skills
        - Preferred skills
        - Experience
        - Education
        - Description
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
        """
        Extract the job title from common job-description formats.
        """

        clean_text = text.strip()

        if not clean_text:
            return "Unknown"

        # ---------------------------------------------------------
        # 1. Explicit title labels
        # ---------------------------------------------------------

        title_patterns = [
            r"(?:job\s*title|position|role)\s*[:\-]\s*([^\n]+)",
            r"(?:job\s*title|position|role)\s+is\s+([^\n]+)"
        ]

        for pattern in title_patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)

            if match:
                title = match.group(1).strip()

                # Remove unnecessary punctuation
                title = re.sub(r"[.!]+$", "", title)

                if title:
                    return title[:100]

        # ---------------------------------------------------------
        # 2. "looking for a/an <role>"
        # ---------------------------------------------------------

        looking_patterns = [
            r"looking\s+for\s+(?:an?\s+)?([A-Za-z][A-Za-z\s/&\-]{2,60}?)(?=\s+with\b|\s+who\b|\s+to\b|[,.])",

            r"we\s+are\s+looking\s+for\s+(?:an?\s+)?([A-Za-z][A-Za-z\s/&\-]{2,60}?)(?=\s+with\b|\s+who\b|\s+to\b|[,.])"
        ]

        for pattern in looking_patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)

            if match:
                title = match.group(1).strip()
                title = self.clean_title(title)

                if self.looks_like_job_title(title):
                    return title

        # ---------------------------------------------------------
        # 3. "hiring a/an <role>"
        # ---------------------------------------------------------

        hiring_pattern = (
            r"(?:we\s+are\s+)?hiring\s+(?:an?\s+)?"
            r"([A-Za-z][A-Za-z\s/&\-]{2,60}?)"
            r"(?=\s+with\b|\s+who\b|\s+to\b|[,.])"
        )

        match = re.search(hiring_pattern, clean_text, re.IGNORECASE)

        if match:
            title = self.clean_title(match.group(1))

            if self.looks_like_job_title(title):
                return title

        # ---------------------------------------------------------
        # 4. "seeking a/an <role>"
        # ---------------------------------------------------------

        seeking_pattern = (
            r"seeking\s+(?:an?\s+)?"
            r"([A-Za-z][A-Za-z\s/&\-]{2,60}?)"
            r"(?=\s+with\b|\s+who\b|\s+to\b|[,.])"
        )

        match = re.search(seeking_pattern, clean_text, re.IGNORECASE)

        if match:
            title = self.clean_title(match.group(1))

            if self.looks_like_job_title(title):
                return title

        # ---------------------------------------------------------
        # 5. Common title appearing at the beginning
        # ---------------------------------------------------------

        lines = [
            line.strip()
            for line in clean_text.splitlines()
            if line.strip()
        ]

        if lines:
            first_line = self.clean_title(lines[0])

            if self.looks_like_job_title(first_line):
                return first_line[:100]

        # ---------------------------------------------------------
        # 6. Search anywhere for common job-title patterns
        # ---------------------------------------------------------

        common_roles = [
            "Python Developer",
            "Software Engineer",
            "Backend Developer",
            "Frontend Developer",
            "Full Stack Developer",
            "Data Scientist",
            "Data Analyst",
            "Machine Learning Engineer",
            "AI Engineer",
            "DevOps Engineer",
            "Cloud Engineer",
            "Java Developer",
            "Web Developer",
            "Software Developer",
            "Cybersecurity Analyst",
            "Cybersecurity Engineer",
            "Database Administrator"
        ]

        for role in common_roles:
            if re.search(r"\b" + re.escape(role) + r"\b", clean_text, re.IGNORECASE):
                return role

        return "Unknown"

    def clean_title(self, title: str) -> str:
        """Clean extracted job title."""

        title = title.strip()

        # Remove leading articles
        title = re.sub(
            r"^(?:a|an|the)\s+",
            "",
            title,
            flags=re.IGNORECASE
        )

        # Remove trailing punctuation
        title = re.sub(r"[.!,:;]+$", "", title)

        return title.strip()

    def looks_like_job_title(self, title: str) -> bool:
        """Basic validation for extracted job titles."""

        if not title:
            return False

        title_lower = title.lower()

        job_keywords = [
            "developer",
            "engineer",
            "scientist",
            "analyst",
            "designer",
            "manager",
            "administrator",
            "architect",
            "specialist",
            "consultant",
            "intern",
            "tester",
            "programmer",
            "recruiter",
            "lead"
        ]

        return any(keyword in title_lower for keyword in job_keywords)

    def extract_required_skills(self, text: str) -> list:
        """
        Extract required skills from the job description.
        """

        return skill_extractor.extract_skills(text)

    def extract_preferred_skills(self, text: str) -> list:
        """
        Placeholder for preferred/nice-to-have skills.
        """

        return []

    def extract_experience(self, text: str) -> str:
        """Extract years of experience."""

        exp_pattern = (
            r"(\d+\+?\s*(?:to|-)?\s*\d*\+?\s*years?.*?experience)"
        )

        match = re.search(
            exp_pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return match.group(1)

        return "Not specified"

    def extract_education(self, text: str) -> str:
        """Extract basic education requirements."""

        edu_keywords = [
            "bachelor",
            "master",
            "phd",
            "degree",
            "bs",
            "ms",
            "b.s.",
            "m.s."
        ]

        for keyword in edu_keywords:
            pattern = r"\b" + re.escape(keyword) + r"\b"

            if re.search(pattern, text, re.IGNORECASE):
                return f"Requires {keyword.title()}"

        return "Not specified"


job_parser = JobParser()