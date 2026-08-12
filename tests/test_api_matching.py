from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))
from app.main import app

client = TestClient(app)

def test_parse_job_endpoint():
    response = client.post("/api/v1/jobs/parse", json={"description": "Looking for a Data Scientist with Python and Pandas."})
    assert response.status_code == 200
    data = response.json()
    assert data["job_title"] != "Unknown"
    assert "python" in data["required_skills"]
    assert "pandas" in data["required_skills"]

def test_recommend_jobs_endpoint():
    response = client.post("/api/v1/jobs/recommend", json={"skills": ["python", "machine learning", "tensorflow"]})
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "Machine Learning Engineer" in [role["role"] for role in data]

def test_match_endpoint():
    resume_data = {
        "raw_text": "I am a Data Scientist. I know Python and SQL.",
        "skills": ["python", "sql"],
        "experience": "3 years"
    }
    job_data = {
        "description": "Data Scientist needed. Must know Python, SQL, and Pandas.",
        "required_skills": ["python", "sql", "pandas"],
        "experience": "Not specified"
    }
    response = client.post("/api/v1/matching/match", json={"resume_data": resume_data, "job_data": job_data})
    assert response.status_code == 200
    data = response.json()
    assert data["match_score"] > 0
    assert data["skill_gap"]["skill_match_percentage"] < 100
    assert "pandas" in data["skill_gap"]["missing_skills"]

def test_rank_candidates_endpoint():
    candidates = [
        {"id": "1", "skills": ["python"], "raw_text": "python dev", "experience": ""},
        {"id": "2", "skills": ["python", "sql", "pandas"], "raw_text": "expert data scientist python sql pandas", "experience": ""}
    ]
    job_data = {
        "description": "Data Scientist needed. Python, SQL, Pandas required.",
        "required_skills": ["python", "sql", "pandas"],
        "experience": "Not specified"
    }
    response = client.post("/api/v1/candidates/rank", json={"candidates": candidates, "job_data": job_data})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["candidate_id"] == "2" # Candidate 2 is a better match
