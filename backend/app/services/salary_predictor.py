"""
Salary Prediction Inference Service.

Loads the trained salary model, predicts salary internally in USD,
and converts the result to Indian Rupees (INR) and LPA for Recruita.
"""

import os
from typing import Any

import joblib
import pandas as pd


class SalaryPredictor:
    # Approximate conversion rate used for development/demo.
    # 1 USD = 84 INR
    USD_TO_INR = 84.0

    def __init__(self) -> None:
        self.model: Any = None
        self.label_encoder: Any = None
        self.available = False

        self._load()

    def _load(self) -> None:
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
            "salary_predictor.pkl",
        )

        encoder_path = os.path.join(
            base_dir,
            "ml",
            "models",
            "salary_label_encoder.pkl",
        )

        if not os.path.exists(model_path):
            print("Salary prediction model not found.")
            return

        if not os.path.exists(encoder_path):
            print("Salary label encoder not found.")
            return

        try:
            self.model = joblib.load(model_path)
            self.label_encoder = joblib.load(encoder_path)
            self.available = True

        except Exception as exc:
            print(f"Failed to load salary model: {exc}")

            self.model = None
            self.label_encoder = None
            self.available = False

    def predict(
        self,
        role: str,
        experience_years: int,
        skill_count: int,
    ) -> dict[str, Any]:

        # --------------------------------------------------
        # MODEL AVAILABILITY CHECK
        # --------------------------------------------------

        if (
            not self.available
            or self.model is None
            or self.label_encoder is None
        ):
            return {
                "predicted_salary": None,
                "predicted_salary_lpa": None,
                "salary_range": None,
                "currency": "INR",
                "salary_unit": "LPA",
                "confidence_note": (
                    "Model not available. "
                    "Train salary model first."
                ),
                "model_version": "unavailable",
            }

        try:
            # --------------------------------------------------
            # 1. ENCODE ROLE
            # --------------------------------------------------

            if role in self.label_encoder.classes_:
                role_encoded = int(
                    self.label_encoder.transform([role])[0]
                )
            else:
                role_encoded = 0

            # --------------------------------------------------
            # 2. PREPARE MODEL FEATURES
            # --------------------------------------------------

            features = pd.DataFrame(
                [
                    {
                        "role_encoded": role_encoded,
                        "experience_years": experience_years,
                        "skill_count": skill_count,
                    }
                ]
            )

            # --------------------------------------------------
            # 3. PREDICT SALARY
            # --------------------------------------------------

            usd_salary = float(
                self.model.predict(features)[0]
            )

            usd_salary = max(usd_salary, 0.0)

            # --------------------------------------------------
            # 4. USD → INR
            # --------------------------------------------------

            inr_salary = usd_salary * self.USD_TO_INR

            # --------------------------------------------------
            # 5. INR → LPA
            # --------------------------------------------------

            lpa = inr_salary / 100_000

            # --------------------------------------------------
            # 6. CREATE DISPLAY SALARY RANGE
            # --------------------------------------------------

            lower_lpa = max(0, int(lpa))
            upper_lpa = lower_lpa + 1

            salary_range = (
                f"₹{lower_lpa}–{upper_lpa}LPA"
            )

            # --------------------------------------------------
            # 7. RETURN RESULT
            # --------------------------------------------------

            return {
                "predicted_salary": round(
                    inr_salary,
                    2,
                ),
                "predicted_salary_lpa": round(
                    lpa,
                    2,
                ),
                "salary_range": salary_range,
                "currency": "INR",
                "salary_unit": "LPA",
                "confidence_note": (
                    "Converted from the trained "
                    "salary model estimate. "
                    "Model trained on synthetic data — "
                    "estimate for development/demo only."
                ),
                "model_version": "v1.0-synthetic",
            }

        except Exception as exc:
            return {
                "predicted_salary": None,
                "predicted_salary_lpa": None,
                "salary_range": None,
                "currency": "INR",
                "salary_unit": "LPA",
                "confidence_note": (
                    f"Prediction error: {exc}"
                ),
                "model_version": "v1.0-synthetic",
            }


salary_predictor = SalaryPredictor()
