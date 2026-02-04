import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Explicitly reload to be sure
    load_dotenv(override=True)
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    print(f"DEBUG: Loading Config. GROQ_API_KEY found: {bool(GROQ_API_KEY)}")
    if GROQ_API_KEY:
        print(f"DEBUG: Key starts with: {GROQ_API_KEY[:4]}")
    
    # Defaults
    DEFAULT_MODEL = "llama-3.3-70b-versatile"
    
    @staticmethod
    def get_api_key():
        return Config.GROQ_API_KEY
