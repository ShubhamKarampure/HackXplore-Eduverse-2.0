import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

def clean_text(text):
    """Clean and preprocess text."""
    text = text.lower()
    text = re.sub(r'\W+', ' ', text)  # Remove special characters
    words = text.split()
    stop_words = set(stopwords.words('english'))
    filtered_words = [w for w in words if w not in stop_words]
    return " ".join(filtered_words)
