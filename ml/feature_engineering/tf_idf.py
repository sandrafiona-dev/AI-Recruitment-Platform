from sklearn.feature_extraction.text import TfidfVectorizer

def get_tfidf_vectorizer(max_features=1000):
    return TfidfVectorizer(
        max_features=max_features,
        stop_words='english',
        ngram_range=(1, 2)
    )
