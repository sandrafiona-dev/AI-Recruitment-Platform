"""
Reusable model evaluation utilities.
Records dataset, train/test split, preprocessing, model, metrics, features, and limitations.
"""
import os
import json
from datetime import datetime


def save_evaluation_report(
    model_name: str,
    dataset_name: str,
    dataset_source: str,
    train_test_split: str,
    preprocessing: str,
    feature_set: list,
    target_variable: str,
    metrics: dict,
    limitations: list,
    is_synthetic: bool = False,
    output_dir: str = None
) -> str:
    """
    Saves a structured evaluation report as JSON to reports/model_evaluation/.
    Does not overwrite previous results — each report has a timestamped filename.
    """
    if output_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        output_dir = os.path.join(base_dir, "reports", "model_evaluation")

    os.makedirs(output_dir, exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{model_name}_{timestamp}.json"
    filepath = os.path.join(output_dir, filename)

    report = {
        "model_name": model_name,
        "timestamp": timestamp,
        "dataset": {
            "name": dataset_name,
            "source": dataset_source,
            "is_synthetic": is_synthetic
        },
        "train_test_split": train_test_split,
        "preprocessing": preprocessing,
        "feature_set": feature_set,
        "target_variable": target_variable,
        "metrics": metrics,
        "limitations": limitations,
        "data_label": "SYNTHETIC-DEV" if is_synthetic else "REAL"
    }

    with open(filepath, "w") as f:
        json.dump(report, f, indent=4)

    print(f"Evaluation report saved: {filepath}")
    return filepath
