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



@app.post("/api/speak")
async def text_to_speech(req: dict):
    # req['text']
    try:
        audio_path = voice.generate_audio(req.get('text', ''))
        return FileResponse(audio_path, media_type="audio/mp3") 
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

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

# Phase 3: Advanced Features

# 1. PDF Report Generation
from fpdf import FPDF
import tempfile

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'Kaushal.ai // Candidate Report', 0, 0, 'C')
        self.ln(20)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Page ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

@app.get("/api/report/pdf")
async def generate_pdf_report():
    try:
        # Fetch Data
        df = db.get_analytics()
        if df.empty:
            raise HTTPException(status_code=404, detail="No data found for report")

        pdf = PDF()
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_font('Arial', '', 12)

        # Candidate Details (Mock for now, or from resume data if we persisted it)
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Candidate Performance Summary', 0, 1)
        pdf.set_font('Arial', '', 12)
        
        # Calculate Stats
        total_questions = len(df)
        avg_score = df['rating'].mean()
        pdf.cell(0, 10, f'Total Missions: {total_questions}', 0, 1)
        pdf.cell(0, 10, f'Average Rating: {avg_score:.1f}/10', 0, 1)
        pdf.ln(10)

        # Performance Table
        pdf.set_font('Arial', 'B', 10)
        pdf.set_fill_color(200, 220, 255)
        pdf.cell(100, 10, 'Question', 1, 0, 'L', 1)
        pdf.cell(30, 10, 'Type', 1, 0, 'C', 1)
        pdf.cell(20, 10, 'Score', 1, 0, 'C', 1)
        pdf.cell(0, 10, 'Feedback', 1, 1, 'L', 1)

        pdf.set_font('Arial', '', 9)
        for _, row in df.iterrows():
            q_text = (row['question'][:50] + '...') if len(row['question']) > 50 else row['question']
            f_text = (row['feedback'][:40] + '...') if len(row['feedback']) > 40 else row['feedback']
            
            pdf.cell(100, 10, q_text, 1)
            pdf.cell(30, 10, row.get('role', 'Gen'), 1, 0, 'C')
            pdf.cell(20, 10, str(row['rating']), 1, 0, 'C')
            pdf.cell(0, 10, f_text, 1, 1)

        # Save to temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        pdf.output(temp_file.name)
        
        return FileResponse(temp_file.name, media_type="application/pdf", filename="kaushal_report.pdf")

    except Exception as e:
        logger.error(f"PDF Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 2. Interactive Code Execution (Piston API)
import requests

class CodeRunRequest(BaseModel):
    code: str
    language: str = "python"

@app.post("/api/arena/run")
async def run_code(req: CodeRunRequest):
    try:
        # Piston API (Public)
        # https://emkc.org/api/v2/piston/execute
        piston_url = "https://emkc.org/api/v2/piston/execute"
        payload = {
            "language": req.language,
            "version": "3.10.0", # Defaulting to Py 3.10
            "files": [
                {
                    "content": req.code
                }
            ]
        }
        
        response = requests.post(piston_url, json=payload)
        result = response.json()
        
        output = result.get('run', {}).get('output', '')
        error = result.get('run', {}).get('stderr', '')
        
        return {
            "output": output,
            "error": error,
            "exit_code": result.get('run', {}).get('code', 0)
        }
    except Exception as e:
        logger.error(f"Piston Error: {e}")
        return {"output": "", "error": str(e), "exit_code": 1}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
