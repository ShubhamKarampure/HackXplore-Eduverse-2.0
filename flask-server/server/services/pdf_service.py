# app/services/pdf_service.py

import os
import requests
from io import BytesIO
from PyPDF2 import PdfReader
from werkzeug.utils import secure_filename
from server.config import app_config 

class PDFService:
    @staticmethod
    def extract_text_from_file_storage(file_storage) -> tuple[str | None, str | None]:
        """
        Saves a FileStorage object temporarily, extracts text, and then deletes the file.
        Returns (extracted_text, error_message).
        """
        if not file_storage or not file_storage.filename:
            return None, "No file provided or filename is empty."

        filename = secure_filename(file_storage.filename)
        temp_path = os.path.join(app_config.UPLOAD_FOLDER, f"temp_{filename}")

        try:
            file_storage.save(temp_path)
            
            text = ""
            with open(temp_path, "rb") as f:
                reader = PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text
            return text, None
        except Exception as e:
            print(f"Error processing PDF file {filename}: {e}")
            return None, f"Failed to process PDF: {str(e)}"
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    @staticmethod
    def extract_text_from_url(pdf_url: str) -> tuple[str | None, str | None]:
        """
        Downloads a PDF from a URL and extracts text.
        Returns (extracted_text, error_message).
        """
        try:
            response = requests.get(pdf_url, timeout=30) # Added timeout
            response.raise_for_status()
            
            file_bytes = BytesIO(response.content)
            reader = PdfReader(file_bytes)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
            return text, None
        except requests.exceptions.RequestException as e:
            print(f"Failed to download PDF from {pdf_url}: {e}")
            return None, f"Failed to download PDF: {str(e)}"
        except Exception as e: # Catches PyPDF2 errors too
            print(f"Failed to extract text from PDF at {pdf_url}: {e}")
            return None, f"Failed to extract text from PDF: {str(e)}"

pdf_service = PDFService()