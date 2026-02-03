import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Defaults
    DEFAULT_MODEL = "gemini-pro"
    
    @staticmethod
    def get_api_key():
        return Config.GEMINI_API_KEY
