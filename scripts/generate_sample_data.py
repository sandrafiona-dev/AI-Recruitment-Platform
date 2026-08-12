import pandas as pd
import os
import random

def generate_sample_data():
    roles = ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "HR Manager"]
    
    # Simple synthetic keywords per role to allow TF-IDF to actually separate them
    keywords = {
        "Software Engineer": ["python", "java", "c++", "react", "node.js", "docker", "kubernetes", "sql", "git", "agile", "backend", "frontend", "fullstack", "api", "rest"],
        "Data Scientist": ["python", "machine learning", "deep learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "sql", "statistics", "model", "nlp", "predictive"],
        "Product Manager": ["agile", "scrum", "roadmap", "strategy", "jira", "user research", "stakeholder management", "kpis", "product lifecycle", "go-to-market", "a/b testing"],
        "UI/UX Designer": ["figma", "sketch", "adobe xd", "wireframing", "prototyping", "user testing", "interaction design", "visual design", "css", "html", "user-centered design"],
        "HR Manager": ["recruitment", "onboarding", "employee relations", "talent acquisition", "performance management", "hr policies", "compliance", "payroll", "interviewing"]
    }
    
    data = []
    
    # Generate 100 samples
    for i in range(1, 201):
        role = random.choice(roles)
        role_keywords = keywords[role]
        
        # Select 5-10 random keywords for this resume
        num_keywords = random.randint(5, min(10, len(role_keywords)))
        selected_keywords = random.sample(role_keywords, num_keywords)
        
        # Add some random noise words
        noise = ["experienced", "motivated", "team player", "leadership", "communication", "problem solving", "degree", "university", "bachelor", "master"]
        selected_noise = random.sample(noise, random.randint(2, 5))
        
        # Construct a simple fake resume text
        all_words = selected_keywords + selected_noise
        random.shuffle(all_words)
        
        resume_text = f"Highly motivated professional. Skills include {', '.join(all_words)}. Strong background in relevant areas. Looking for a challenging position as a {role}."
        
        experience_years = random.randint(1, 15)
        # Synthetic realistic-ish salary based on role and experience
        base_salary = {"Software Engineer": 80000, "Data Scientist": 90000, "Product Manager": 95000, "UI/UX Designer": 70000, "HR Manager": 65000}
        salary = base_salary[role] + (experience_years * 5000) + random.randint(-10000, 10000)
        
        # Synthetic interview score based loosely on experience + noise
        interview_score = min(100, max(0, 40 + (experience_years * 3) + random.randint(-20, 20)))
        
        # Success flag (0 or 1), slightly correlated with interview score
        success_flag = 1 if interview_score > 70 and random.random() > 0.2 else 0
        
        data.append({
            "id": f"RES-{i:03d}",
            "text": resume_text,
            "role": role,
            "experience_years": experience_years,
            "salary": salary,
            "interview_score": interview_score,
            "success_flag": success_flag
        })
        
    df = pd.DataFrame(data)
    
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets", "raw")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "resume_dataset.csv")
    df.to_csv(output_path, index=False)
    
    print(f"Sample dataset generated successfully at {output_path}")
    print(f"Total records: {len(df)}")
    print("Class distribution:")
    print(df['role'].value_counts())

if __name__ == "__main__":
    generate_sample_data()
