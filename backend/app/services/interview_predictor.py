"""
Interview Performance Prediction Inference Service.
"""

import os

import joblib


class InterviewPredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.available = False
        self._load()

    def _load(self):
        base_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(__file__)
                )
            )
        )

        model_path = os.path.join(
            base_dir,
            "ml",
            "models",
            "interview_predictor.pkl",
        )

        le_path = os.path.join(
            base_dir,
            "ml",
            "models",
            "interview_label_encoder.pkl",
        )

        if os.path.exists(model_path) and os.path.exists(le_path):
            try:
                self.model = joblib.load(model_path)
                self.label_encoder = joblib.load(le_path)
                self.available = True

            except Exception as e:
                print(
                    f"Failed to load interview model: {e}"
                )

        else:
            print(
                "Interview prediction model not found. "
                "Train it first."
            )

    def predict(
        self,
        role: str,
        experience_years: int,
        skill_count: int,
    ) -> dict:
        """
        Predict interview performance score.

        Returns a score from 0-100.
        """

        # -------------------------------------------------
        # Model availability check
        # -------------------------------------------------
        if (
            not self.available
            or self.model is None
            or self.label_encoder is None
        ):
            return {
                "predicted_score": None,
                "scale": "0-100",
                "confidence_note": (
                    "Model not available. "
                    "Train interview model first."
                ),
                "model_version": "unavailable",
            }

        try:
            # -------------------------------------------------
            # Encode candidate role
            # -------------------------------------------------
            if role in self.label_encoder.classes_:
                role_encoded = (
                    self.label_encoder.transform(
                        [role]
                    )[0]
                )
            else:
                # Unknown roles use a neutral fallback.
                role_encoded = 0

            # -------------------------------------------------
            # Build model input
            # -------------------------------------------------
            import pandas as pd

            features = pd.DataFrame(
                [
                    {
                        "role_encoded": role_encoded,
                        "experience_years": experience_years,
                        "skill_count": skill_count,
                    }
                ]
            )

            # -------------------------------------------------
            # Generate prediction
            # -------------------------------------------------
            prediction = self.model.predict(
                features
            )[0]

            # -------------------------------------------------
            # Keep prediction within 0-100
            # -------------------------------------------------
            prediction = max(
                0,
                min(
                    100,
                    prediction,
                ),
            )

            return {
                "predicted_score": round(
                    float(prediction),
                    2,
                ),
                "scale": "0-100",
                "confidence_note": (
                    "Trained on synthetic data — "
                    "estimate for development/demo only"
                ),
                "model_version": "v1.0-synthetic",
            }

        except Exception as e:
            return {
                "predicted_score": None,
                "scale": "0-100",
                "confidence_note": (
                    f"Prediction error: {str(e)}"
                ),
                "model_version": "v1.0-synthetic",
            }


interview_predictor = InterviewPredictor()
