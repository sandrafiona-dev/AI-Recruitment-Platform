# Dataset Documentation

## Resume Sample Dataset

* **Dataset name:** Synthetic Resume Sample Dataset
* **Source:** Synthetically generated via `scripts/generate_sample_data.py`
* **Purpose:** To bootstrap the ML pipeline and allow end-to-end testing of feature engineering, model training, and EDA without relying on external sensitive data.
* **Format:** CSV
* **Important columns:**
  * `id`: Unique identifier for the resume
  * `text`: The raw text of the resume containing skills and experience
  * `role`: The target job role classification label
* **Approximate records:** 200 records
* **License/usage note:** MIT / Synthetically generated for this project.
* **Related project module:** Resume Classification ML pipeline (`ml/training/train_model.py`)
* **Data limitations:** The data is highly synthetic and contains only a handful of structured keywords and noise words. It does not represent real-world resume complexity, structure, length, or semantic nuance. Models trained on this data will not generalize to real resumes.

## Real Dataset Architecture

For realistic resume-to-job matching, skill gap analysis, and recommendations, you should replace the synthetic dataset with real data. The project supports importing real data from CSV/JSON formats into standard schemas.

### Recommended Public Dataset Sources
- **Resumes**: 
  - Kaggle "Resume Dataset" (Kaggle)
  - Hugging Face `resume-dataset`
- **Job Descriptions**:
  - Kaggle "Data Scientist Job Market in the US"
  - Hugging Face `jacob-hugging-face/job-descriptions`
- **Skills/Job Roles**:
  - O*NET OnLine Database
  - EMSI Open Skills API (or exported open-source equivalents)

### Expected Schemas

#### Resumes Dataset (`datasets/processed/processed_resumes.csv`)
| Column | Type | Description |
|---|---|---|
| `id` | String | Unique candidate ID |
| `text` | String | Full raw text extracted from the resume |
| `role` | String | The candidate's primary job title/category (for training/evaluation) |

#### Job Descriptions Dataset (`datasets/processed/processed_jobs.csv`)
| Column | Type | Description |
|---|---|---|
| `id` | String | Unique job ID |
| `title` | String | The job title |
| `description` | String | Full raw text of the job description including requirements |

### Import Utility
To import real data, place your CSV files in `datasets/raw/` as `real_resumes.csv` and `real_jobs.csv`. Then run:
```bash
python scripts/import_dataset.py
```
This utility will normalize column names and save the processed files in `datasets/processed/`. The ML pipelines should then be updated to point to the `processed/` directory.
