from app.services.ranking import ranking_service

def test_rank_candidates():
    candidates = [
        {
            "id": "c1",
            "name": "Alice",
            "raw_text": "I am a frontend developer with 5 years experience. I know React and HTML.",
            "skills": ["react", "html"],
            "experience": "5 years"
        },
        {
            "id": "c2",
            "name": "Bob",
            "raw_text": "I am a backend developer. I write Python and SQL.",
            "skills": ["python", "sql"],
            "experience": "2 years"
        },
        {
            "id": "c3",
            "name": "Charlie",
            "raw_text": "I know everything. Python, React, SQL, AWS, Docker.",
            "skills": ["python", "react", "sql", "aws", "docker"],
            "experience": "10 years"
        }
    ]
    
    job_data = {
        "job_title": "Full Stack Developer",
        "description": "Looking for a full stack developer with Python and React skills. AWS is a plus.",
        "required_skills": ["python", "react", "sql"],
        "experience": "5 years"
    }
    
    ranked = ranking_service.rank_candidates(candidates, job_data)
    
    assert len(ranked) == 3
    # Charlie has all skills, should be first
    assert ranked[0]["candidate_id"] == "c3"
    # Alice has partial skills, Bob has partial skills. 
    # Match score determines order.
    assert ranked[0]["match_score"] > ranked[1]["match_score"]
    assert ranked[1]["match_score"] >= ranked[2]["match_score"]
