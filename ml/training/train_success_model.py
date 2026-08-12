"""
Candidate Success Prediction Training Pipeline.

Input features:  role (encoded), experience_years, skill_count, interview_score
Target variable: success_flag (binary: 0 or 1)
Model:           Logistic Regression
Evaluation:      Accuracy, Precision, Recall, F1, ROC-AUC

"Success" definition in the synthetic dataset:
    success_flag = 1 if interview_score > 70 and random() > 0.2, else 0
    This is an artificially constructed label, NOT a real hiring outcome.

IMPORTANT: This model is trained on synthetic data. The "success" target
           does not represent real-world hiring success (e.g., job tenure,
           performance reviews, or promotion). Real labeled hiring outcome
           data is required for production use.
"""
import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ml.evaluation.evaluator import save_evaluation_report


def train_success_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_path = os.path.join(base_dir, "datasets", "raw", "resume_dataset.csv")

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Cannot train success model.")
        return None

    df = pd.read_csv(data_path)

    required_cols = ["role", "experience_years", "interview_score", "success_flag", "text"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"Dataset missing columns for success prediction: {missing}")
        return None

    le = LabelEncoder()
    df["role_encoded"] = le.fit_transform(df["role"])

    from backend.app.services.skill_extractor import skill_extractor
    df["skill_count"] = df["text"].apply(lambda t: len(skill_extractor.extract_skills(t)))

    features = ["role_encoded", "experience_years", "skill_count", "interview_score"]
    X = df[features]
    y = df["success_flag"]

    # Check class balance
    class_counts = y.value_counts()
    print(f"Class distribution: {class_counts.to_dict()}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Use class_weight='balanced' to handle potential imbalance
    model = LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42)
    print("Training candidate success model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    try:
        roc_auc = roc_auc_score(y_test, y_prob)
    except ValueError:
        roc_auc = None  # Only one class present in test set

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1:        {f1:.4f}")
    if roc_auc is not None:
        print(f"ROC-AUC:   {roc_auc:.4f}")

    model_dir = os.path.join(base_dir, "ml", "models")
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, "success_predictor.pkl"))
    joblib.dump(le, os.path.join(model_dir, "success_label_encoder.pkl"))
    print(f"Success model saved to {model_dir}")

    metrics_dict = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "F1": round(f1, 4)
    }
    if roc_auc is not None:
        metrics_dict["ROC_AUC"] = round(roc_auc, 4)

    save_evaluation_report(
        model_name="success_predictor",
        dataset_name="resume_dataset.csv",
        dataset_source="Synthetic (scripts/generate_sample_data.py)",
        train_test_split="80/20, stratified, random_state=42",
        preprocessing="LabelEncoder for role, skill count from text",
        feature_set=features,
        target_variable="success_flag",
        metrics=metrics_dict,
        limitations=[
            "success_flag is artificially constructed (interview_score > 70 + randomness)",
            "Does not represent real hiring outcomes like job tenure or performance",
            "Uses class_weight='balanced' to handle synthetic class imbalance",
            "Real labeled hiring outcome data required for production use",
            "Potential for bias if real data includes proxy features for protected attributes"
        ],
        is_synthetic=True
    )

    return model


if __name__ == "__main__":
    train_success_model()
