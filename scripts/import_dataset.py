import os
import pandas as pd
import json

def import_dataset():
    """
    Imports raw public datasets (resumes or job descriptions) from datasets/raw/
    and normalizes them into standard schema formats in datasets/processed/.
    """
    base_dir = os.path.dirname(os.path.dirname(__file__))
    raw_dir = os.path.join(base_dir, "datasets", "raw")
    processed_dir = os.path.join(base_dir, "datasets", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    
    print("Checking for real datasets in datasets/raw/...")
    
    # 1. Look for resumes dataset
    resumes_csv = os.path.join(raw_dir, "real_resumes.csv")
    if os.path.exists(resumes_csv):
        try:
            df = pd.read_csv(resumes_csv)
            # Normalize column names if needed
            if 'resume_text' in df.columns:
                df.rename(columns={'resume_text': 'text'}, inplace=True)
            if 'job_role' in df.columns:
                df.rename(columns={'job_role': 'role'}, inplace=True)
            
            output_path = os.path.join(processed_dir, "processed_resumes.csv")
            df[['id', 'text', 'role']].to_csv(output_path, index=False)
            print(f"Processed real resumes dataset to {output_path}")
        except Exception as e:
            print(f"Error processing real resumes: {e}")
            
    # 2. Look for job descriptions dataset
    jobs_csv = os.path.join(raw_dir, "real_jobs.csv")
    if os.path.exists(jobs_csv):
        try:
            df = pd.read_csv(jobs_csv)
            # Normalize
            if 'description' not in df.columns and 'job_description' in df.columns:
                df.rename(columns={'job_description': 'description'}, inplace=True)
            if 'title' not in df.columns and 'job_title' in df.columns:
                df.rename(columns={'job_title': 'title'}, inplace=True)
                
            output_path = os.path.join(processed_dir, "processed_jobs.csv")
            df[['id', 'title', 'description']].to_csv(output_path, index=False)
            print(f"Processed real job descriptions to {output_path}")
        except Exception as e:
            print(f"Error processing real jobs: {e}")

if __name__ == "__main__":
    import_dataset()
