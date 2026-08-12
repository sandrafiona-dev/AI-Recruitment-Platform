from app.services.parser import ResumeParser

def test_extract_email():
    parser = ResumeParser()
    text = "My email is john.doe@example.com and my phone is 555-123-4567."
    assert parser.extract_email(text) == "john.doe@example.com"

def test_extract_phone():
    parser = ResumeParser()
    text = "My email is john.doe@example.com and my phone is 555-123-4567."
    assert parser.extract_phone(text) == "555-123-4567"

def test_extract_skills():
    parser = ResumeParser()
    text = "I have experience with Python, Java, and React."
    skills = parser.extract_skills(text)
    assert "python" in skills
    assert "java" in skills
    assert "react" in skills
    assert "c++" not in skills
