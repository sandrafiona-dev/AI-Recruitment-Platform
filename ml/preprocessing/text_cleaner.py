import re
import string

def clean_text(text: str) -> str:
    """
    Cleans text by removing punctuation, converting to lowercase, 
    and removing extra whitespace while preserving skills.
    """
    if not isinstance(text, str):
        return ""
        
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation
    text = text.translate(str.maketrans(string.punctuation, ' ' * len(string.punctuation)))
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

class TextPreprocessor:
    def __init__(self):
        pass
        
    def fit(self, X, y=None):
        return self
        
    def transform(self, X):
        return [clean_text(text) for text in X]
