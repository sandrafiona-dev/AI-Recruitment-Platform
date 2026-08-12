from ml.preprocessing.text_cleaner import clean_text

def test_clean_text():
    raw_text = "This is a TEST! With some Punctuation. And   extra    spaces."
    cleaned = clean_text(raw_text)
    assert cleaned == "this is a test with some punctuation and extra spaces"

def test_clean_text_empty():
    assert clean_text("") == ""
    assert clean_text(None) == ""
