import pandas as pd
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import sys
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from ml.preprocessing.text_cleaner import TextPreprocessor
from ml.feature_engineering.tf_idf import get_tfidf_vectorizer

def train_and_evaluate():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_path = os.path.join(base_dir, "datasets", "raw", "resume_dataset.csv")
    
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    X = df['text']
    y = df['role']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    pipeline = Pipeline([
        ('preprocessor', TextPreprocessor()),
        ('tfidf', get_tfidf_vectorizer()),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    
    print("Training model...")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = pipeline.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred)
    conf_matrix = confusion_matrix(y_test, y_pred).tolist()
    
    print(f"Accuracy: {accuracy:.4f}")
    print("Classification Report:\n", report)
    
    # Save metrics
    eval_dir = os.path.join(base_dir, "ml", "evaluation")
    os.makedirs(eval_dir, exist_ok=True)
    with open(os.path.join(eval_dir, "metrics.json"), "w") as f:
        json.dump({
            "accuracy": accuracy,
            "confusion_matrix": conf_matrix
        }, f, indent=4)
        
    # Save model
    model_dir = os.path.join(base_dir, "ml", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "resume_classifier.pkl")
    joblib.dump(pipeline, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_evaluate()
