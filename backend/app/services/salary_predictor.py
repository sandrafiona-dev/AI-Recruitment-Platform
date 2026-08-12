"""
Salary Prediction Inference Service.
Loads the trained salary model and provides predictions.
"""
import os
import joblib


class SalaryPredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.available = False
        self._load()

    def _load(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        model_path = os.path.join(base_dir, "ml", "models", "salary_predictor.pkl")
        le_path = os.path.join(base_dir, "ml", "models", "salary_label_encoder.pkl")

        if os.path.exists(model_path) and os.path.exists(le_path):
            try:
                self.model = joblib.load(model_path)
                self.label_encoder = joblib.load(le_path)
                self.available = True
            except Exception as e:
                print(f"Failed to load salary model: {e}")
        else:
            print("Salary prediction model not found. Train it first with train_salary_model.py")

    def predict(self, role: str, experience_years: int, skill_count: int) -> dict:
        if not self.available:
            return {
                "predicted_salary": None,
                "currency": "USD",
                "confidence_note": "Model not available. Train salary model first.",
                "model_version": "unavailable"
            }

        try:
            # Encode role — handle unknown roles gracefully
            if role in self.label_encoder.classes_:
                role_encoded = self.label_encoder.transform([role])[0]
            else:
                role_encoded = 0  # Default encoding for unknown roles

            import pandas as pd
            features = pd.DataFrame([{
                "role_encoded": role_encoded,
                "experience_years": experience_years,
                "skill_count": skill_count
            }])

            prediction = self.model.predict(features)[0]

            return {
                "predicted_salary": round(float(prediction), 2),
                "currency": "USD",
                "confidence_note": "Trained on synthetic data — estimate for development/demo only",
                "model_version": "v1.0-synthetic"
            }
        except Exception as e:
            return {
                "predicted_salary": None,
                "currency": "USD",
                "confidence_note": f"Prediction error: {str(e)}",
                "model_version": "v1.0-synthetic"
            }


salary_predictor = SalaryPredictor()
