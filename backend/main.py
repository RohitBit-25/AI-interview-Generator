from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path to import existing modules
sys.path.append("..") 
from resume_parser import ResumeParser
from llm_handler import LLMHandler
from config import Config
from db_handler import DBHandler

app = FastAPI(title="AI Interview Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Handlers
API_KEY = Config.get_api_key()
llm = LLMHandler(API_KEY)
db = DBHandler()

# Models
class QuestionRequest(BaseModel):
    resume_text: str
    role: str = "Software Engineer"
    difficulty: str = "Medium"
    count: int = 3

class AnswerRequest(BaseModel):
    question: str
    user_answer: str

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI Interview Assistant Backend Running"}

@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    print(f"Received file upload: {file.filename}")
    try:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        parser = ResumeParser(temp_file)
        # Simplify extraction for now
        data = {
            "text": parser.text,
            "skills": parser.extract_skills(),
            "experience": parser.extract_experience(),
            "projects": parser.extract_projects()
        }
        
        # Cleanup
        os.remove(temp_file)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-questions")
async def generate_questions(req: QuestionRequest):
    print(f"Generating questions for role: {req.role}")
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    
    questions = llm.generate_questions(req.resume_text, req.role, req.difficulty, req.count)
    if not questions:
         raise HTTPException(status_code=500, detail="Failed to generate questions. LLM returned empty response.")
    return {"questions": questions}

@app.post("/api/evaluate")
async def evaluate_answer(req: AnswerRequest):
    print(f"Evaluating answer for: {req.question[:50]}...")
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    
    feedback = llm.evaluate_answer(req.question, req.user_answer)
    return feedback

@app.get("/api/dashboard")
async def get_dashboard():
    df = db.get_analytics()
    if df.empty:
        return []
    # Convert to list of dicts for JSON
    return df.to_dict(orient="records")

# Voice Handling
from fastapi.responses import FileResponse
from voice_handler import VoiceHandler

voice_handler = VoiceHandler()

class SpeakRequest(BaseModel):
    text: str

@app.post("/api/speak")
async def speak(req: SpeakRequest):
    audio_path = voice_handler.generate_audio(req.text)
    if not audio_path:
        raise HTTPException(status_code=500, detail="Audio generation failed")
    return FileResponse(audio_path, media_type="audio/mpeg", filename="speech.mp3")

@app.post("/api/listen")
async def listen(file: UploadFile = File(...)):
    print(f"Received audio upload: {file.filename}")
    try:
        # Save temp audio file
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Transcribe
        text = voice_handler.transcribe_audio(temp_file)
        
        # Cleanup
        os.remove(temp_file)
        
        return {"text": text}
    except Exception as e:
        print(f"Listen error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
