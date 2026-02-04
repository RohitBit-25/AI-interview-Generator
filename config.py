import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # Defaults
    DEFAULT_MODEL = "llama3-70b-8192"
    
    @staticmethod
    def get_api_key():
        return Config.GROQ_API_KEY
