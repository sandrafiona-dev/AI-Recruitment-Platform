"""
Salary Prediction Model Training Pipeline.

Input features:  role (one-hot encoded), experience_years, number of skills
Target variable: salary (continuous)
Model:           Gradient Boosting Regressor
Evaluation:      MAE, RMSE, R²
Dataset:         Synthetic development fallback (datasets/raw/resume_dataset.csv)

IMPORTANT: This model is trained on synthetic data and is NOT production-ready.
           Real salary data (e.g., from Glassdoor, Levels.fyi, or internal HR systems)
           is required for production use.
"""
import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ml.evaluation.evaluator import save_evaluation_report


def train_salary_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_path = os.path.join(base_dir, "datasets", "raw", "resume_dataset.csv")

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Cannot train salary model.")
        return None

    df = pd.read_csv(data_path)

    # Verify required columns exist
    required_cols = ["role", "experience_years", "salary", "text"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"Dataset missing columns for salary prediction: {missing}")
        print("Salary model requires: role, experience_years, salary, text")
        return None

    # Feature engineering
    le = LabelEncoder()
    df["role_encoded"] = le.fit_transform(df["role"])

    # Count skills from text as a simple numeric feature
    from backend.app.services.skill_extractor import skill_extractor
    df["skill_count"] = df["text"].apply(lambda t: len(skill_extractor.extract_skills(t)))

    features = ["role_encoded", "experience_years", "skill_count"]
    X = df[features]
    y = df["salary"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    print("Training salary prediction model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"MAE:  {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²:   {r2:.4f}")

    # Save model and label encoder
    model_dir = os.path.join(base_dir, "ml", "models")
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, "salary_predictor.pkl"))
    joblib.dump(le, os.path.join(model_dir, "salary_label_encoder.pkl"))
    print(f"Salary model saved to {model_dir}")

    # Save evaluation report
    save_evaluation_report(
        model_name="salary_predictor",
        dataset_name="resume_dataset.csv",
        dataset_source="Synthetic (scripts/generate_sample_data.py)",
        train_test_split="80/20, random_state=42",
        preprocessing="LabelEncoder for role, skill count from text",
        feature_set=features,
        target_variable="salary",
        metrics={"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)},
        limitations=[
            "Trained on synthetic data — salary values are artificially generated",
            "Does not use location, company size, or industry",
            "Skill count is a rough proxy for skill depth",
            "Not suitable for production salary estimates"
        ],
        is_synthetic=True
    )

    return model


if __name__ == "__main__":
    train_salary_model()
