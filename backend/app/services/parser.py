import re
import io
import PyPDF2
import docx

class ResumeParser:
    def __init__(self):
        pass
        
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text += page.extract_text() + " "
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
        if filename.lower().endswith(".pdf"):
            return self.extract_text_from_pdf(file_bytes)
        elif filename.lower().endswith(".docx"):
            return self.extract_text_from_docx(file_bytes)
        elif filename.lower().endswith(".txt"):
            return file_bytes.decode('utf-8', errors='ignore')
        return ""
        
    def extract_email(self, text: str) -> str:
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        return match.group(0) if match else ""
        
    def extract_phone(self, text: str) -> str:
        phone_pattern = r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        match = re.search(phone_pattern, text)
        return match.group(0) if match else ""
        
    def extract_skills(self, text: str) -> list:
        from app.services.skill_extractor import skill_extractor
        return skill_extractor.extract_skills(text)
        
    def parse(self, file_bytes: bytes, filename: str) -> dict:
        text = self.extract_text(file_bytes, filename)
        
        # Simple extraction
        return {
            "name": "Unknown", # Would need NER (e.g. spacy) for reliable name extraction
            "email": self.extract_email(text),
            "phone": self.extract_phone(text),
            "skills": self.extract_skills(text),
            "education": [], # Requires more complex parsing rules or NLP
            "experience": [], # Requires more complex parsing rules or NLP
            "raw_text": text.strip()
        }
