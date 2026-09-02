# Recruita — AI Recruitment Platform

Recruita is a full-stack AI-assisted recruitment platform designed to help recruiters analyze resumes, match candidates to job descriptions, rank applicants, identify skill gaps, and generate candidate insights.

The project combines **NLP, machine learning, resume parsing, candidate matching, ranking, and recruiter analytics** in a single web application.

> **Project status:** Functional academic/prototype project with working AI-assisted recruitment workflows. Some predictive models use synthetic training data and should not be treated as production hiring models.

---

## ✨ Features

### 📄 Resume Intelligence

- Upload and parse **PDF, DOCX, and TXT** resumes
- Extract:
  - Name
  - Email
  - Phone
  - Skills
  - Experience
  - Resume text
- Predict a suitable job role using a trained NLP classifier

### 🎯 Candidate–Job Matching

- Compare candidate resumes against job descriptions
- Calculate an overall match score
- Analyze:
  - Text similarity
  - Skill match
  - Experience match
- Identify:
  - Matching skills
  - Missing skills
  - Skill gaps
- Classify candidates into:
  - Strong Match
  - Good Match
  - Potential Match
  - Low Match

### 🏆 Candidate Ranking

- Rank candidates based on match scores
- Support recruiter shortlisting
- Provide structured candidate comparison

### 🤖 Machine Learning Predictions

The platform includes experimental ML models for:

- Resume role classification
- Interview score prediction
- Salary prediction
- Hiring-success prediction

> Predictive models for interview, salary, and hiring success are experimental and rely on synthetic development data. They are included for academic/prototyping purposes and require real, representative datasets before production use.

### 📊 Recruiter Dashboard

- Candidate statistics
- Recruitment analytics
- Candidate ranking information
- Evaluation summaries
- Recruitment workflow overview

### ⚡ Full-Stack Architecture

- React + Vite frontend
- FastAPI backend
- REST API architecture
- Single-deployment support through FastAPI serving the built React frontend
- Docker configuration
- Automated build/CI workflow

---

## 🧠 AI & Matching Methodology

Recruita combines deterministic matching techniques with machine learning models.

### Candidate–Job Matching

The current matching engine uses:

| Component | Weight |
| --- | ---: |
| Text Similarity | 50% |
| Skill Match | 40% |
| Experience Match | 10% |

The final score is calculated from these weighted components.

### Text Similarity

Resume and job-description text are transformed using **TF-IDF** and compared using **cosine similarity**.

### Skill Matching

Skills are extracted using dictionary/regex-based matching and compared between the candidate and job requirements.

The system identifies:

- Matching skills
- Missing skills
- Skill-gap percentage

### Experience Matching

The system extracts required and candidate experience where available and calculates an experience-match component.

### Match Classification

| Score | Classification |
| ---: | --- |
| ≥ 80 | Strong Match |
| ≥ 65 | Good Match |
| ≥ 50 | Potential Match |
| < 50 | Low Match |

---

## 🤖 Machine Learning

### Resume Role Classification

The real-resume classification pipeline uses:

- TF-IDF vectorization
- Word n-grams
- Logistic Regression
- Class balancing
- Stratified train/test split

The trained model predicts a suitable role/category from resume text.

### Other Predictive Models

Experimental models are included for:

- Interview score prediction
- Salary prediction
- Hiring-success prediction

These models are intended to demonstrate the architecture and workflow rather than provide reliable real-world hiring decisions.

---

## 🏗️ Architecture

```text
                         Recruita
                            │
              ┌─────────────┴─────────────┐
              │                           │
        React + Vite                 FastAPI
        Frontend                     Backend
              │                           │
              │                  ┌────────┴────────┐
              │                  │                 │
              │              API Routes         Services
              │                  │                 │
              │                  ├─ Resume Parser
              │                  ├─ Matching
              │                  ├─ Ranking
              │                  ├─ Recommendation
              │                  └─ Predictions
              │                                    │
              │                              ML Models
              │                                    │
              │                        ┌───────────┴───────────┐
              │                        │                       │
              │                  NLP / TF-IDF          Predictive Models
              │
              └────────────── HTTP / JSON ──────────────┘
```

---

## 🔄 Recruitment Workflow

```text
Resume Upload
     │
     ▼
Resume Parsing
     │
     ▼
Information Extraction
     │
     ├── Skills
     ├── Experience
     ├── Contact Information
     └── Resume Text
     │
     ▼
Role Prediction
     │
     ▼
Job Matching
     │
     ├── Text Similarity
     ├── Skill Match
     └── Experience Match
     │
     ▼
Match Score
     │
     ▼
Candidate Ranking
     │
     ▼
Recruiter Shortlisting
```

---

## 🛠️ Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| API | REST, Axios |
| NLP | TF-IDF, scikit-learn |
| Machine Learning | scikit-learn |
| Resume Processing | PDF/DOCX/TXT parsing |
| Data Processing | Pandas, NumPy |
| ML Models | Logistic Regression, Random Forest |
| Deployment | Docker, FastAPI static serving |
| CI | GitHub Actions |

---

## 📁 Project Structure

```text
AI-Recruitment-Platform/
│
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── database/
│       ├── models/
│       ├── schemas/
│       └── services/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
├── ml/
│   ├── models/
│   ├── training/
│   └── inference/
│
├── datasets/
│   ├── raw/
│   ├── processed/
│   └── external/
│
├── docs/
├── scripts/
├── tests/
├── Dockerfile
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

> Large datasets and trained model artifacts are intentionally excluded from the public repository through `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Python 3.10+
- Node.js 18+
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sandrafiona-dev/AI-Recruitment-Platform.git
cd AI-Recruitment-Platform
```

### 2. Backend setup

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/macOS

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

### 3. Environment configuration

Create:

```text
backend/.env
```

Example:

```env
APP_NAME=AI Recruitment Platform API
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
LOG_LEVEL=INFO
```

Do not commit secrets, credentials, private datasets, or other sensitive information.

### 4. Start the backend

```bash
python -m uvicorn app.main:app --reload --app-dir backend
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### 5. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🧪 Testing

Run the backend test suite with:

```bash
pytest
```

The project also includes GitHub Actions CI for automated build validation.

---

## 📚 Documentation

Additional project documentation is available in the `docs/` directory.

### Matching Methodology

See:

```text
docs/Matching_Methodology.md
```

for details about:

- Matching weights
- Skill extraction
- Candidate ranking
- Role recommendation
- Dataset limitations
- Fairness considerations

### Dataset Documentation

See:

```text
docs/Dataset_Documentation.md
```

for information about:

- Synthetic development data
- Dataset structure
- External dataset references
- Data limitations

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.
