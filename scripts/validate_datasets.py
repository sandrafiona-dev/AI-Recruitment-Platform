import pandas as pd
import os
from datetime import datetime

def validate_datasets():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    datasets_dir = os.path.join(base_dir, "datasets", "raw")
    reports_dir = os.path.join(base_dir, "reports")
    
    os.makedirs(reports_dir, exist_ok=True)
    report_path = os.path.join(reports_dir, "validation_report.md")
    
    report_content = [
        f"# Dataset Validation Report",
        f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        ""
    ]
    
    found_datasets = False
    
    if os.path.exists(datasets_dir):
        for filename in os.listdir(datasets_dir):
            if filename.endswith(".csv"):
                found_datasets = True
                filepath = os.path.join(datasets_dir, filename)
                try:
                    df = pd.read_csv(filepath)
                    report_content.extend([
                        f"## Validation for `{filename}`",
                        f"- **Row count:** {len(df)}",
                        f"- **Column count:** {len(df.columns)}",
                        f"- **Columns:** {', '.join(df.columns.tolist())}",
                        f"- **Missing values:** {df.isnull().sum().sum()}",
                        f"- **Duplicate records:** {df.duplicated().sum()}",
                        ""
                    ])
                    
                    if df.duplicated().sum() > 0:
                        report_content.append(f"**Warning:** Found {df.duplicated().sum()} duplicate records.")
                    if df.isnull().sum().sum() > 0:
                        report_content.append(f"**Warning:** Found {df.isnull().sum().sum()} missing values.")
                except Exception as e:
                    report_content.append(f"## Validation for `{filename}`")
                    report_content.append(f"**Error:** Could not read file: {e}\n")
    
    if not found_datasets:
        report_content.append("No datasets found to validate.")
        
    with open(report_path, "w") as f:
        f.write("\n".join(report_content))
        
    print(f"Validation complete. Report generated at {report_path}")

if __name__ == "__main__":
    validate_datasets()
