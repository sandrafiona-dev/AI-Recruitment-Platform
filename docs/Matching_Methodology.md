# Matching Methodology

This document outlines the matching, skill gap analysis, and recommendation logic used in the AI Recruitment Platform.

## 1. Resume-to-Job Matching Formula

The matching engine uses a hybrid approach, combining text similarity, structured skill overlap, and experience compatibility. 

### Weighted Components
The final match score is normalized to a 0-100 scale, calculated as a weighted sum of three components:
- **Text Similarity (50%)**: Cosine similarity of TF-IDF vectors between the raw resume text and the job description.
- **Skill Match (40%)**: The percentage of required job skills that are present in the candidate's extracted skills.
- **Experience Match (10%)**: A baseline heuristic comparing candidate experience to required experience (currently simplified for the MVP).

*Note: These weights are configurable baselines and can be adjusted in `backend/app/services/matching.py` as the system evolves.*

## 2. Skill Extraction

Skills are extracted using a centralized, categorized vocabulary defined in `backend/app/services/skill_extractor.py`.
- **Extraction Method**: Case-insensitive regular expression matching with word boundaries to prevent partial matches (e.g., matching "c" but not "cat").
- **Deduplication**: Extracted skills are returned as a deduplicated set.
- **Fallback**: Substring matching is used for multi-word skills to ensure robustness.

## 3. Skill Gap Analysis

When comparing a candidate to a job:
- **Matched Skills**: The intersection of the candidate's skills and the job's required skills.
- **Missing Skills**: The set difference between the job's required skills and the candidate's skills.
- **Match Percentage**: `(Matched Skills / Required Skills) * 100`.

## 4. Job Role Recommendation

The recommendation engine (`backend/app/services/recommendation.py`) maps candidate skills against predefined role profiles (e.g., "Python Developer", "Data Scientist").
- **Compatibility Calculation**: For each role, the system calculates the percentage of required skills the candidate possesses.
- **Ranking**: Roles are sorted descending by compatibility score, and the top N roles are returned.

## 5. Candidate Ranking

The `ranking_service` evaluates an array of candidates against a single job description.
- Each candidate is passed through the Matching Engine.
- Candidates are sorted in descending order based on their final `match_score`.
- **Fairness Note**: The ranking is deterministic and solely based on text, skills, and experience. No protected attributes (e.g., gender, race, age) are extracted or used in the ranking logic.

## 6. Synthetic vs. Real Data

The current MVP uses synthetic data for model training (Resume Classification). However, the Matching Engine relies directly on the extracted features (skills, text) and does not inherently depend on the synthetic training data. To achieve production-level accuracy, real job descriptions and resumes should be imported using the `import_dataset.py` utility as detailed in `Dataset_Documentation.md`.

## Limitations
- **Experience Parsing**: Currently a placeholder heuristic. True experience parsing requires complex NER and chronological mapping.
- **Skill Variations**: While robust to casing, the system currently requires exact matches for skills (e.g., "React.js" vs "React"). A synonym map should be introduced in future iterations.
- **Implicit Skills**: The system does not infer skills (e.g., inferring "SQL" from "PostgreSQL").
