import os
import sys
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Add parent directory to path to find resume_parser, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import existing logic
from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from llm_handler import LLMHandler
from voice_handler import VoiceHandler
import config

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Handlers
try:
    API_KEY = config.Config.get_api_key()
    llm = LLMHandler(API_KEY)
    voice = VoiceHandler()
except Exception as e:
    logger.error(f"Failed to initialize handlers: {e}")

# Models
class InterviewStartRequest(BaseModel):
    resume_text: str
    role: str

class InterviewNextRequest(BaseModel):
    resume_text: str
    history: List[dict]
    last_answer: str
    skipped: Optional[bool] = False

class ArenaProblemRequest(BaseModel):
    resume_text: str
    role: str

class ArenaSubmitRequest(BaseModel):
    problem: str
    code: str

# Endpoints

@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        parser = ResumeParser(temp_path)
        parsed_data = parser.parse()
        text = parser.text
        
        # Clean up
        os.remove(temp_path)
        
        return {"data": {"text": text, "parsed": parsed_data}}
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/start")
async def start_interview(req: InterviewStartRequest):
    try:
        # Generate initial question
        if API_KEY:
            questions = llm.generate_questions(req.resume_text, req.role, "Medium")
            first_q = questions[0] if questions else {"question": "Tell me about yourself.", "type": "Intro", "topic": "General"}
        else:
            # Fallback
            first_q = {"question": "Tell me about yourself.", "type": "Intro", "topic": "General"}
            
        return first_q
    except Exception as e:
        logger.error(f"Start error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/next")
async def next_question(req: InterviewNextRequest):
    try:
        evaluation = {}
        if not req.skipped and API_KEY:
            evaluation = llm.evaluate_answer(req.history[-1]['question'] if req.history else "Intro", req.last_answer)
        
        # Generate next question logic
        # For simplicity, we ask LLM for the NEXT question based on history
        # Or we could have generated a list at start. 
        # Let's simple-gen a new one dynamics
        
        next_q_prompt = f"Ask a follow up question based on recent history: {len(req.history)} questions asked."
        if API_KEY:
             # In a real app we'd pass history context to LLM
             questions = llm.generate_questions(req.resume_text, "Candidate", "Medium")
             # Pick a random new one or next in list logic
             import random
             next_q = random.choice(questions)
        else:
             next_q = {"question": "What is your greatest strength?", "type": "Behavioral", "topic": "General"}

        return {
            "evaluation": evaluation,
            "next_question": next_q
        }
    except Exception as e:
        logger.error(f"Next error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speak")
async def text_to_speech(req: dict):
    # req['text']
    try:
        audio_path = voice.generate_audio(req.get('text', ''))
        return File(audio_path, media_type="audio/mp3") # This might need proper FileResponse
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/listen")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        # Save blob
        temp_audio = f"temp_{file.filename}"
        with open(temp_audio, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = voice.transcribe_audio(open(temp_audio, "rb").read())
        os.remove(temp_audio)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Arena Endpoints
@app.post("/api/arena/problem")
async def get_arena_problem(req: ArenaProblemRequest):
    # Mock or LLM gen
    return {
        "title": "Reverse Linked List",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "difficulty": "Medium",
        "starter_code": "def reverseList(head):\n    # Your code here\n    pass"
    }

@app.post("/api/arena/submit")
async def submit_arena(req: ArenaSubmitRequest):
    if API_KEY:
        review = llm.review_code(req.problem, req.code)
        return review
    return {"feedback": "No API Key", "rating": 0, "is_correct": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
