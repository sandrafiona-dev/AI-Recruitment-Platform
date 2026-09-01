id="s9k2lm"
"""
Candidate Success Prediction Inference Service.
"""

import os

import joblib


class SuccessPredictor:
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
            "success_predictor.pkl",
        )

        le_path = os.path.join(
            base_dir,
            "ml",
            "models",
            "success_label_encoder.pkl",
        )

        if os.path.exists(model_path) and os.path.exists(le_path):
            try:
                self.model = joblib.load(model_path)
                self.label_encoder = joblib.load(le_path)
                self.available = True

            except Exception as e:
                print(
                    f"Failed to load success model: {e}"
                )

        else:
            print(
                "Success prediction model not found. "
                "Train it first."
            )

    def predict(
        self,
        role: str,
        experience_years: int,
        skill_count: int,
        interview_score: float | None = None,
    ) -> dict:
        """
        Predict candidate success probability.

        Returns:
            predicted_success:
                Boolean prediction indicating whether
                the candidate is predicted to succeed.

            probability:
                Probability of successful outcome
                on a 0-1 scale.
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
                "predicted_success": None,
                "probability": None,
                "confidence_note": (
                    "Model not available. "
                    "Train success model first."
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
            # Use neutral interview score when unavailable
            # -------------------------------------------------
            if interview_score is None:
                interview_score = 50.0

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
                        "interview_score": interview_score,
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
            # Generate probabilities
            # -------------------------------------------------
            probabilities = self.model.predict_proba(
                features
            )[0]

            # -------------------------------------------------
            # Identify success class
            # -------------------------------------------------
            classes = list(
                self.model.classes_
            )

            if 1 in classes:
                success_index = classes.index(1)

                success_probability = (
                    probabilities[success_index]
                )
            else:
                success_probability = 0.0

            # -------------------------------------------------
            # Return result
            # -------------------------------------------------
            return {
                "predicted_success": bool(
                    prediction
                ),
                "probability": round(
                    float(success_probability),
                    4,
                ),
                "confidence_note": (
                    "Trained on synthetic data — "
                    "estimate for development/demo only"
                ),
                "model_version": "v1.0-synthetic",
            }

        except Exception as e:
            return {
                "predicted_success": None,
                "probability": None,
                "confidence_note": (
                    f"Prediction error: {str(e)}"
                ),
                "model_version": "v1.0-synthetic",
            }


success_predictor = SuccessPredictor()