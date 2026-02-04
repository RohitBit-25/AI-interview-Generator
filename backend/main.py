from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
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
from voice_handler import VoiceHandler

app = FastAPI(title="AI Interview Assistant API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Handlers
API_KEY = Config.get_api_key()
llm = LLMHandler(API_KEY)
db = DBHandler()
voice_handler = VoiceHandler()

# Models
class QuestionRequest(BaseModel):
    resume_text: str
    role: str = "Software Engineer"
    difficulty: str = "Medium"
    count: int = 3

class AnswerRequest(BaseModel):
    question: str
    user_answer: str

class SpeakRequest(BaseModel):
    text: str

class StartInterviewRequest(BaseModel):
    resume_text: str
    role: str = "Software Engineer"

class NextQuestionRequest(BaseModel):
    resume_text: str
    history: List[Dict[str, Any]]
    last_answer: str

class QuizRequest(BaseModel):
    skills: List[str]

class ArenaRequest(BaseModel):
    problem: str
    code: str

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
        data = {
            "text": parser.text,
            "skills": parser.extract_skills(),
            "experience": parser.extract_experience(),
            "projects": parser.extract_projects()
        }
        
        os.remove(temp_file)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-questions")
async def generate_questions(req: QuestionRequest):
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    questions = llm.generate_questions(req.resume_text, req.role, req.difficulty, req.count)
    return {"questions": questions}

@app.post("/api/evaluate")
async def evaluate_answer(req: AnswerRequest):
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    return llm.evaluate_answer(req.question, req.user_answer)

@app.get("/api/dashboard")
async def get_dashboard():
    df = db.get_analytics()
    if df.empty: return []
    return df.to_dict(orient="records")

@app.post("/api/speak")
async def speak(req: SpeakRequest):
    audio_path = voice_handler.generate_audio(req.text)
    if not audio_path:
        raise HTTPException(status_code=500, detail="Audio generation failed")
    return FileResponse(audio_path, media_type="audio/mpeg", filename="speech.mp3")

@app.post("/api/listen")
async def listen(file: UploadFile = File(...)):
    try:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        text = voice_handler.transcribe_audio(temp_file)
        os.remove(temp_file)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/start")
async def start_interview_endpoint(req: StartInterviewRequest):
    if not llm.is_configured():
         return {
             "question": "Tell me about yourself and your experience with Python.",
             "type": "Behavioral",
             "topic": "Introduction",
             "hints": ["Keep it brief"]
         }
    response = llm.start_interview(req.resume_text, req.role)
    if not response:
        raise HTTPException(status_code=500, detail="Failed to start interview")
    return response

@app.post("/api/interview/next")
async def next_question_endpoint(req: NextQuestionRequest):
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    response = llm.continue_interview(req.resume_text, req.history, req.last_answer)
    if not response:
        raise HTTPException(status_code=500, detail="Failed to continue interview")
    return response

@app.post("/api/quiz")
async def generate_quiz_endpoint(req: QuizRequest):
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    return {"questions": llm.generate_quiz(req.skills)}

@app.post("/api/arena/submit")
async def submit_arena_code(req: ArenaRequest):
    if not llm.is_configured():
        raise HTTPException(status_code=500, detail="LLM not configured")
    return llm.review_code(req.problem, req.code)
