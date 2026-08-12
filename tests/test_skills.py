from app.services.skill_extractor import skill_extractor

def test_extract_skills_case_insensitivity():
    text = "Experience with PYTHON, java, and ReAcT."
    skills = skill_extractor.extract_skills(text)
    assert "python" in skills
    assert "java" in skills
    assert "react" in skills

def test_extract_skills_boundaries():
    text = "We love cats and music."
    skills = skill_extractor.extract_skills(text)
    # 'c' is a skill, but 'cat' shouldn't match it
    assert "c" not in skills

def test_extract_skills_special_characters():
    text = "Strong skills in C++ and Node.js."
    skills = skill_extractor.extract_skills(text)
    assert "c++" in skills
    assert "node.js" in skills

def test_categorize_skills():
    skills = ["python", "react", "docker"]
    categorized = skill_extractor.categorize_skills(skills)
    assert "Programming" in categorized
    assert "python" in categorized["Programming"]
    assert "Web" in categorized
    assert "react" in categorized["Web"]
    assert "Cloud/DevOps" in categorized
    assert "docker" in categorized["Cloud/DevOps"]
