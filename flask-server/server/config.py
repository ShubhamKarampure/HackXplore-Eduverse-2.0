# =config.py
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings # Added
from qdrant_client import models as qdrant_models

load_dotenv()

class Config:

    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    QDRANT_URL = os.getenv("QDRANT_URL")

    # Model Names & Parameters
    GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", 'gemini-1.5-flash') 
    EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")

    # Qdrant Configuration
    QDRANT_SYLLABUS_COLLECTION = os.getenv("QDRANT_SYLLABUS_COLLECTION", "syllabus")
    QDRANT_REFERENCE_COLLECTION = os.getenv("QDRANT_REFERENCE_COLLECTION", "references")
    QDRANT_VECTOR_SIZE = int(os.getenv("QDRANT_VECTOR_SIZE", 384)) 
    QDRANT_DISTANCE_METRIC = qdrant_models.Distance.COSINE 

    # File Paths
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

    # Initialize clients and LLMs here to be imported by services
    GEMINI_LLM = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL_NAME,
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key=GEMINI_API_KEY,
    )

    # Centralized Embedding Model Instance
    EMBEDDINGS = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    # Create 'uploads' directory if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

# Instantiate config
app_config = Config()