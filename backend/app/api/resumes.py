from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

from app.services.parser import ResumeParser
from app.services.classifier import ResumeClassifier

router = APIRouter(prefix="/api/v1/resumes", tags=["resumes"])

# Using singletons or dependencies for services
parser = ResumeParser()
classifier = ResumeClassifier()

class ParsedResumeResponse(BaseModel):
    name: str
    email: str
    phone: str
    skills: List[str]
    education: List[str]
    experience: List[str]
    raw_text: str
    predicted_role: Optional[str] = None

@router.post("/parse", response_model=ParsedResumeResponse)
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    try:
        contents = await file.read()
        parsed_data = parser.parse(contents, file.filename)
        
        # Optionally classify as well
        predicted_role = classifier.predict(parsed_data['raw_text'])
        parsed_data['predicted_role'] = predicted_role
        
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
