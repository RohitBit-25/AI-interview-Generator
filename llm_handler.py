from groq import Groq
import json
from typing import List, Dict, Any
from config import Config

class LLMHandler:
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            self.client = Groq(api_key=api_key)
            self.model_name = Config.DEFAULT_MODEL # "llama3-70b-8192"
        else:
            self.client = None

    def is_configured(self):
        return self.client is not None

    def generate_questions(self, resume_text: str, role: str, difficulty: str, count: int = 3) -> List[Dict[str, Any]]:
        if not self.is_configured(): return []
        prompt = f"""
        Act as a professional Interviewer for a {role} position.
        Analyze the following resume text and generate {count} {difficulty}-level interview questions.
        Resume: {resume_text[:4000]}
        
        Return a JSON Object with a key "questions" containing an array of objects.
        Format:
        {{
            "questions": [
                {{ "question": "...", "type": "Technical/Behavioral", "topic": "...", "hints": ["Hint 1"] }}
            ]
        }}
        """
        response = self._generate_json(prompt)
        return response.get("questions", []) if response else []

    def evaluate_answer(self, question: str, user_answer: str) -> Dict[str, Any]:
        if not self.is_configured(): return {"feedback": "LLM not configured.", "rating": 0}
        prompt = f"""
        Question: "{question}"
        Candidate's Answer: "{user_answer}"
        Evaluate the answer.
        Return JSON: {{ "rating": <0-10>, "feedback": "...", "better_answer": "..." }}
        """
        return self._generate_json(prompt)

    def start_interview(self, resume_text: str, role: str) -> Dict[str, Any]:
        if not self.is_configured(): return None
        prompt = f"""
        Act as a {role} Interviewer. Start with an ice-breaker or technical question based on this resume:
        {resume_text[:2000]}
        Return JSON: {{ "question": "...", "type": "Behavioral", "topic": "Intro", "hints": ["..."] }}
        """
        return self._generate_json(prompt)

    def continue_interview(self, resume_text: str, history: List[Dict], last_answer: str) -> Dict[str, Any]:
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
        if not self.is_configured(): return []
        skills_str = ", ".join(skills[:5])
        prompt = f"""
        Generate 5 Multiple Choice Questions (MCQ) testing these skills: {skills_str}.
        Return JSON Object with key "questions":
        {{
            "questions": [
                {{
                    "question": "...",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "A",
                    "explanation": "..."
                }}
            ]
        }}
        """
        response = self._generate_json(prompt)
        return response.get("questions", []) if response else []

    def generate_coding_problem(self, resume_text: str, role: str) -> Dict[str, Any]:
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
    
    def analyze_star(self, question: str, answer: str) -> Dict[str, Any]:
        if not self.is_configured(): return {}
        prompt = f"""
        Analyze if answer follows STAR format.
        Question: {question}
        Answer: {answer}
        Return JSON: {{ "star_score": int, "missing_components": [], "feedback": "..." }}
        """
        return self._generate_json(prompt)

    def detect_role_from_resume(self, resume_text: str) -> str:
        """
        Analyzes the resume text to determine the candidate's primary job role.
        """
        if not self.is_configured(): return "Software Engineer"
        prompt = f"""
        Analyze the following resume text and identify the single most appropriate job role title for this candidate.
        Examples: "Frontend Engineer", "Data Scientist", "DevOps Engineer", "Project Manager", "Python Developer".
        Return ONLY the role title, nothing else.

        Resume Text:
        {resume_text[:2000]}
        """
        try:
            role = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert HR recruiter."},
                    {"role": "user", "content": prompt}
                ],
                model="llama3-8b-8192",
                temperature=0.1,
            ).choices[0].message.content.strip()
            # Cleanup if the model returns extra chars
            return role.split('\n')[0].replace('"', '').strip()
        except Exception as e:
            print(f"Role detection error: {e}")
            return "Software Engineer"

    def _generate_json(self, prompt: str) -> Any:
        try:
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant that ALWAYS returns valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model_name,
                response_format={"type": "json_object"},
                temperature=0.7
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Groq API Error: {e}")
            return {}
