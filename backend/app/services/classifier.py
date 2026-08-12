import os
import joblib

class ResumeClassifier:
    def __init__(self):
        self.model = None
        self.load_model()
        
    def load_model(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        model_path = os.path.join(base_dir, "ml", "models", "resume_classifier.pkl")
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
            except Exception as e:
                print(f"Failed to load model: {e}")
        else:
            print(f"Model not found at {model_path}. Train the model first.")
            
    def predict(self, text: str) -> str:
        if not self.model:
            return "Model not loaded"
            
        if not text.strip():
            return "Unknown"
            
        try:
            prediction = self.model.predict([text])[0]
            return prediction
        except Exception as e:
            print(f"Prediction error: {e}")
            return "Error during prediction"
