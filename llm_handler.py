import google.generativeai as genai
import json
from typing import List, Dict, Any
import utils

class LLMHandler:
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def is_configured(self):
        return self.model is not None

    def generate_questions(self, resume_text: str, role: str, difficulty: str, count: int = 3) -> List[Dict[str, Any]]:
        if not self.is_configured(): return []
        prompt = f"""
        Act as a professional Interviewer for a {role} position.
        Analyze the following resume text and generate {count} {difficulty}-level interview questions.
        Resume: {resume_text[:4000]}
        Return ONLY a raw JSON array:
        [
            {{ "question": "...", "type": "Technical/Behavioral", "topic": "...", "hints": ["Hint 1"] }}
        ]
        """
        response = self._generate_json(prompt)
        return response if isinstance(response, list) else []

    def evaluate_answer(self, question: str, user_answer: str) -> Dict[str, Any]:
        if not self.is_configured(): return {"feedback": "LLM not configured.", "rating": 0}
        prompt = f"""
        Question: "{question}"
        Candidate's Answer: "{user_answer}"
        Evaluate the answer.
        Return ONLY JSON: {{ "rating": <0-10>, "feedback": "...", "better_answer": "..." }}
        """
        return self._generate_json(prompt)

    def start_interview(self, resume_text: str, role: str) -> Dict[str, Any]:
        """Generates the first question to start the interview."""
        if not self.is_configured(): return None
        prompt = f"""
        Act as a {role} Interviewer. Start with an ice-breaker or technical question based on this resume:
        {resume_text[:2000]}
        Return JSON: {{ "question": "...", "type": "Behavioral", "topic": "Intro", "hints": ["..."] }}
        """
        return self._generate_json(prompt)

    def continue_interview(self, resume_text: str, history: List[Dict], last_answer: str) -> Dict[str, Any]:
        """Evaluates answer and generates next question."""
        if not self.is_configured(): return None
        history_str = json.dumps(history)
        prompt = f"""
        Resume: {resume_text[:1000]}
        History: {history_str}
        Last Answer: {last_answer}
        
        1. Evaluate last answer.
        2. Generate NEXT question (adaptive).
        Return JSON: 
        {{
            "evaluation": {{ "feedback": "...", "rating": 8, "better_answer": "..." }},
            "next_question": {{ "question": "...", "type": "...", "topic": "...", "hints": ["..."] }}
        }}
        """
        return self._generate_json(prompt)

    def generate_quiz(self, skills: List[str]) -> List[Dict[str, Any]]:
        """Generates 5 MCQs based on skills."""
        if not self.is_configured(): return []
        skills_str = ", ".join(skills[:5])
        prompt = f"""
        Generate 5 Multiple Choice Questions (MCQ) testing these skills: {skills_str}.
        Return JSON Array:
        [
            {{
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "A",
                "explanation": "..."
            }}
        ]
        """
        response = self._generate_json(prompt)
        return response if isinstance(response, list) else []

    def analyze_jd_gap(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        if not self.is_configured(): return {}
        prompt = f"""
        Compare Resume and JD.
        Resume: {resume_text[:2000]}
        JD: {jd_text[:2000]}
        Identify 3 gaps and questions.
        Return JSON: {{ "missing_skills": [], "analysis": "...", "questions": [] }}
        """
        return self._generate_json(prompt)

    def generate_coding_problem(self, resume_text: str, role: str) -> Dict[str, Any]:
        """Generates a coding problem based on resume skills."""
        if not self.is_configured(): return {}
        prompt = f"""
        Generate a coding interview problem for a {role} candidate based on this resume:
        {resume_text[:2000]}
        
        Return JSON: 
        {{
            "title": "Problem Title",
            "description": "Detailed problem description...",
            "difficulty": "Easy/Medium/Hard",
            "starter_code": "def solution():\\n    pass"
        }}
        """
        return self._generate_json(prompt)

    def review_code(self, problem: str, user_code: str) -> Dict[str, Any]:
        if not self.is_configured(): return {}
        prompt = f"""
        Review this code for: "{problem}".
        Code: {user_code}
        Return JSON: {{ "is_correct": bool, "rating": int, "feedback": "...", "time_complexity": "...", "optimized_code": "..." }}
        """
        return self._generate_json(prompt)

    def analyze_star(self, question: str, answer: str) -> Dict[str, Any]:
        if not self.is_configured(): return {}
        prompt = f"""
        Analyze if answer follows STAR format.
        Question: {question}
        Answer: {answer}
        Return JSON: {{ "star_score": int, "missing_components": [], "feedback": "..." }}
        """
        return self._generate_json(prompt)

    def _generate_json(self, prompt: str) -> Any:
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
            return json.loads(text)
        except Exception as e:
            print(f"LLM Error: {e}")
            return {}
