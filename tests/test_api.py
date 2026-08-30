from fastapi.testclient import TestClient
import io
import sys
import os

# Add the backend directory to python path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_parse_resume_endpoint_invalid_file():
    # Provide a file with wrong extension
    file_content = b"Fake content"
    files = {"file": ("test.png", file_content, "image/png")}
    response = client.post("/api/v1/resumes/parse", files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file format"

def test_parse_resume_endpoint_txt_file():
    file_content = b"John Doe\njohn@example.com\n555-123-4567\nSkills: Python, Java"
    files = {"file": ("resume.txt", file_content, "text/plain")}
    response = client.post("/api/v1/resumes/parse", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["phone"] == "555-123-4567"
    assert "python" in data["skills"]
