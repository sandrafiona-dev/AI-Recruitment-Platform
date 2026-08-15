import re
import io
# pyrefly: ignore [missing-import]
import PyPDF2
# pyrefly: ignore [missing-import]
import docx


class ResumeParser:
    def __init__(self):
        pass

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""

        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))

            for page in reader.pages:
                page_text = page.extract_text() or ""
                text += page_text + " "

        except Exception as e:
            print(f"Error extracting PDF: {e}")

        return text

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        text = ""

        try:
            doc = docx.Document(io.BytesIO(file_bytes))

            for para in doc.paragraphs:
                text += para.text + " "

        except Exception as e:
            print(f"Error extracting DOCX: {e}")

        return text

    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        filename = filename.lower()

        if filename.endswith(".pdf"):
            return self.extract_text_from_pdf(file_bytes)

        elif filename.endswith(".docx"):
            return self.extract_text_from_docx(file_bytes)

        elif filename.endswith(".txt"):
            return file_bytes.decode("utf-8", errors="ignore")

        return ""

    def extract_email(self, text: str) -> str:
        email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

        match = re.search(email_pattern, text)

        return match.group(0) if match else ""

    def extract_phone(self, text: str) -> str:
        phone_pattern = r"\+?\d[\d\s().-]{8,}\d"

        match = re.search(phone_pattern, text)

        return match.group(0).strip() if match else ""

    def extract_name(self, text: str) -> str:
        """
        Extract the candidate's name from the resume.

        Strategy:
        1. Look at the first meaningful lines.
        2. Ignore headings/contact information.
        3. Accept likely 2-4 word names.
        4. Fall back to the email username if needed.
        """

        if not text:
            return "Unknown"

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        ignored_words = {
            "resume",
            "curriculum vitae",
            "cv",
            "profile",
            "summary",
            "objective",
            "contact",
            "education",
            "experience",
            "skills",
            "projects",
            "certifications",
            "professional summary",
            "linkedin",
            "github",
        }

        # ---------------------------------------------------------
        # 1. Check the first few lines for a multi-line name
        # ---------------------------------------------------------
        # PDF extraction may return:
        #
        # Sandra
        # Fiona
        #
        # instead of:
        #
        # Sandra Fiona

        for i in range(min(6, len(lines) - 1)):
            first = re.sub(r"\s+", " ", lines[i]).strip()
            second = re.sub(r"\s+", " ", lines[i + 1]).strip()

            # Both should be simple alphabetic name parts
            if (
                re.fullmatch(r"[A-Za-z]+(?:[-'][A-Za-z]+)?", first)
                and re.fullmatch(r"[A-Za-z]+(?:[-'][A-Za-z]+)?", second)
                and first.lower() not in ignored_words
                and second.lower() not in ignored_words
            ):
                return f"{first} {second}"

        # ---------------------------------------------------------
        # 2. Check for a normal single-line full name
        # ---------------------------------------------------------
        for line in lines[:10]:

            cleaned = re.sub(r"\s+", " ", line).strip()

            if len(cleaned) > 50:
                continue

            # Ignore email
            if "@" in cleaned:
                continue

            # Ignore phone numbers
            if re.search(r"\d{5,}", cleaned):
                continue

            # Ignore headings
            if cleaned.lower() in ignored_words:
                continue

            # Normal full name
            if re.fullmatch(
                r"[A-Za-z]+(?:[ .'-][A-Za-z]+){1,4}",
                cleaned
            ):
                return cleaned

        return "Unknown"

    def extract_skills(self, text: str) -> list:
        from app.services.skill_extractor import skill_extractor

        return skill_extractor.extract_skills(text)

    def parse(self, file_bytes: bytes, filename: str) -> dict:

        text = self.extract_text(file_bytes, filename)

        return {
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "phone": self.extract_phone(text),
            "skills": self.extract_skills(text),
            "education": [],
            "experience": [],
            "raw_text": text.strip(),
        }