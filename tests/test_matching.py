from app.services.matching import matching_service
from app.services.recommendation import recommendation_service

def test_skill_gap_analysis():
    candidate = ["Python", "SQL"]
    required = ["Python", "Docker", "SQL", "AWS"]
    result = matching_service.calculate_skill_gap(candidate, required)
    
    assert "python" in result["matched_skills"]
    assert "sql" in result["matched_skills"]
    assert "docker" in result["missing_skills"]
    assert "aws" in result["missing_skills"]
    assert result["skill_match_percentage"] == 50.0

def test_text_similarity():
    # Empty texts
    assert matching_service.calculate_text_similarity("", "") == 0.0
    
    # Identical texts
    sim = matching_service.calculate_text_similarity("Python developer", "Python developer")
    assert sim > 0.99
    
    # Completely different texts
    diff_sim = matching_service.calculate_text_similarity("data science pandas", "frontend react html css")
    assert diff_sim < 0.1

def test_role_recommendation():
    skills = ["javascript", "react", "html", "css"]
    recs = recommendation_service.recommend_roles(skills, top_n=2)
    assert len(recs) == 2
    assert recs[0]["role"] == "Frontend Developer"
    assert recs[0]["score"] > 50
    
def test_no_skills_recommendation():
    recs = recommendation_service.recommend_roles([], top_n=2)
    assert len(recs) == 0
