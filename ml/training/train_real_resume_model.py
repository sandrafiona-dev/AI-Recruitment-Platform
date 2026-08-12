from pathlib import Path
import json
import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = ROOT / "datasets" / "processed" / "real_resumes.csv"
MODEL_DIR = ROOT / "ml" / "models" / "real_resume_classifier"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


def main():
    df = pd.read_csv(DATA_PATH)

    df = df.dropna(subset=["resume_text", "role"])
    df = df[df["resume_text"].str.strip() != ""]
    df = df[df["role"].str.strip() != ""]

    X = df["resume_text"]
    y = df["role"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    model = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    lowercase=True,
                    stop_words="english",
                    ngram_range=(1, 2),
                    min_df=2,
                    max_df=0.95,
                    sublinear_tf=True,
                    max_features=50000,
                ),
            ),
            (
                "classifier",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                ),
            ),
        ]
    )

    print("Training real resume classifier...")
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Classes: {y.nunique()}")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(
        y_test, predictions, average="weighted", zero_division=0
    )
    recall = recall_score(
        y_test, predictions, average="weighted", zero_division=0
    )
    f1_weighted = f1_score(
        y_test, predictions, average="weighted", zero_division=0
    )
    f1_macro = f1_score(
        y_test, predictions, average="macro", zero_division=0
    )

    print("\n===== REAL RESUME MODEL RESULTS =====")
    print(f"Accuracy:       {accuracy:.4f}")
    print(f"Precision:      {precision:.4f}")
    print(f"Recall:         {recall:.4f}")
    print(f"Weighted F1:    {f1_weighted:.4f}")
    print(f"Macro F1:       {f1_macro:.4f}")

    print("\n===== CLASSIFICATION REPORT =====")
    print(classification_report(y_test, predictions, zero_division=0))

    model_path = MODEL_DIR / "model.joblib"
    metrics_path = MODEL_DIR / "metrics.json"

    joblib.dump(model, model_path)

    metrics = {
        "dataset": "Kaggle Resume Dataset",
        "samples": int(len(df)),
        "classes": int(y.nunique()),
        "test_size": 0.20,
        "random_state": 42,
        "accuracy": float(accuracy),
        "precision_weighted": float(precision),
        "recall_weighted": float(recall),
        "f1_weighted": float(f1_weighted),
        "f1_macro": float(f1_macro),
        "categories": sorted(y.unique().tolist()),
    }

    metrics_path.write_text(
        json.dumps(metrics, indent=2),
        encoding="utf-8",
    )

    print("\nSaved model:")
    print(model_path)

    print("\nSaved metrics:")
    print(metrics_path)


if __name__ == "__main__":
    main()