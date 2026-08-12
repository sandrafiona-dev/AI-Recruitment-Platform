"""
Interview Performance Prediction Training Pipeline.

Input features:  role (encoded), experience_years, skill_count
Target variable: interview_score (continuous, 0-100)
Model:           Random Forest Regressor
Evaluation:      MAE, RMSE, R²

IMPORTANT: The interview_score in the synthetic dataset is artificially generated
           and loosely correlated with experience_years + noise.
           A real interview dataset with actual assessment scores is required
           for any meaningful production use.
"""
import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ml.evaluation.evaluator import save_evaluation_report


def train_interview_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_path = os.path.join(base_dir, "datasets", "raw", "resume_dataset.csv")

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Cannot train interview model.")
        return None

    df = pd.read_csv(data_path)

    required_cols = ["role", "experience_years", "interview_score", "text"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"Dataset missing columns for interview prediction: {missing}")
        return None

    le = LabelEncoder()
    df["role_encoded"] = le.fit_transform(df["role"])

    from backend.app.services.skill_extractor import skill_extractor
    df["skill_count"] = df["text"].apply(lambda t: len(skill_extractor.extract_skills(t)))

    features = ["role_encoded", "experience_years", "skill_count"]
    X = df[features]
    y = df["interview_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    print("Training interview performance model...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"MAE:  {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    print(f"R²:   {r2:.4f}")

    model_dir = os.path.join(base_dir, "ml", "models")
    os.makedirs(model_dir, exist_ok=True)
    joblib.dump(model, os.path.join(model_dir, "interview_predictor.pkl"))
    joblib.dump(le, os.path.join(model_dir, "interview_label_encoder.pkl"))
    print(f"Interview model saved to {model_dir}")

    save_evaluation_report(
        model_name="interview_predictor",
        dataset_name="resume_dataset.csv",
        dataset_source="Synthetic (scripts/generate_sample_data.py)",
        train_test_split="80/20, random_state=42",
        preprocessing="LabelEncoder for role, skill count from text",
        feature_set=features,
        target_variable="interview_score",
        metrics={"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)},
        limitations=[
            "interview_score is synthetically generated, not from real assessments",
            "Correlation with experience is artificially injected",
            "Does not capture communication, problem-solving, or cultural fit",
            "Real interview assessment data required for production"
        ],
        is_synthetic=True
    )

    return model


if __name__ == "__main__":
    train_interview_model()
