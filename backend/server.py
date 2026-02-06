import os
import sys
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# ... (imports) ...

@app.post("/api/speak")
async def text_to_speech(req: dict):
    # req['text']
    try:
        audio_path = voice.generate_audio(req.get('text', ''))
        return FileResponse(audio_path, media_type="audio/mp3") 
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

# Add parent directory to path to find resume_parser, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import existing logic
from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from llm_handler import LLMHandler
from voice_handler import VoiceHandler
from db_handler import DBHandler # Added
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
    db = getattr(config, 'db', None) or DBHandler()
except Exception as e:
    logger.error(f"Failed to initialize handlers: {e}")
    db = DBHandler()

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

class QuizRequest(BaseModel):
    skills: List[str]

# Helpers
import uuid
SESSION_ID = str(uuid.uuid4()) # Simple session tracking for this run

class QuizRequest(BaseModel):
    skills: List[str]

# Endpoints

@app.post("/api/quiz")
async def generate_quiz(req: QuizRequest):
    try:
        if API_KEY:
            # Dynamic Generation
            quiz_questions = llm.generate_quiz(req.skills)
            return {"questions": quiz_questions}
        else:
            raise HTTPException(status_code=400, detail="API_KEY required for dynamic quiz")
    except Exception as e:
        logger.error(f"Quiz error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        # Auto-Detect Role
        detected_role = "Software Engineer"
        if API_KEY:
             detected_role = llm.detect_role_from_resume(text)
        
        return {
            "data": {
                "text": text, 
                "parsed": parsed_data,
                "detected_role": detected_role
            }
        }
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
            # Optimized Flow: Single combined call for evaluation + adaptive next question
            result = llm.continue_interview(req.resume_text, req.history, req.last_answer)
            
            if result:
                evaluation = result.get("evaluation", {})
                next_q = result.get("next_question", None)
                
                # Save to DB
                db.save_interaction(
                    session_id=SESSION_ID,
                    role="Software Engineer",
                    difficulty="Medium",
                    question=req.history[-1]['question'] if req.history else "Intro",
                    answer=req.last_answer,
                    feedback=evaluation.get("feedback", ""),
                    rating=evaluation.get("rating", 0),
                    q_type="Interview"
                )
                
                return {
                    "evaluation": evaluation,
                    "next_question": next_q
                }
        
        # Fallback or Skip Logic
        # ... existing fallback code if needed, but for now we rely on continue_interview
        
        return {
            "evaluation": {"feedback": "Skipped or API Error", "rating": 0},
            "next_question": {"question": "Describe a challenging project you worked on.", "type": "Behavioral", "topic": "Project"}
        }
    except Exception as e:
        logger.error(f"Next error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
async def get_dashboard_stats():
    try:
        df = db.get_analytics()
        if df.empty:
            return []
        
        # Convert DataFrame to list of dicts for JSON response
        # We process it to match the dashboard frontend expectation
        stats = []
        for _, row in df.iterrows():
            stats.append({
                "question": row['question'],
                "user_answer": row['answer'],
                "rating": row['rating'],
                "topic": row.get('role', 'General'), # Reuse role as topic/tag for now
                "feedback": row['feedback'],
                "timestamp": row['timestamp']
            })
        return stats
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        return []



@app.post("/api/listen")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        # Read bytes directly
        file_bytes = await file.read()
        text = voice.transcribe_audio(file_bytes)
        
        # Cleanup not needed as we read bytes directly
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Arena Endpoints
@app.post("/api/arena/problem")
async def get_arena_problem(req: ArenaProblemRequest):
    if API_KEY:
        return llm.generate_coding_problem(req.resume_text, req.role)
    raise HTTPException(status_code=400, detail="API_KEY required")

@app.post("/api/arena/submit")
async def submit_arena(req: ArenaSubmitRequest):
    if API_KEY:
        review = llm.review_code(req.problem, req.code)
        # Save attempt to DB
        db.save_interaction(
            session_id=SESSION_ID,
            role="Dev",
            difficulty="Hard",
            question=req.problem,
            answer=req.code,
            feedback=review.get("feedback", ""),
            rating=review.get("rating", 0),
            q_type="Arena"
        )
        return review
    raise HTTPException(status_code=400, detail="API_KEY required")

class LogRequest(BaseModel):
    role: str
    difficulty: str
    question: str
    answer: str
    feedback: str
    rating: int
    type: str

@app.post("/api/log")
async def log_interaction(req: LogRequest):
    try:
        db.save_interaction(
            session_id=SESSION_ID,
            role=req.role,
            difficulty=req.difficulty,
            question=req.question,
            answer=req.answer,
            feedback=req.feedback,
            rating=req.rating,
            q_type=req.type
        )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Log error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
