import google.generativeai as genai
import json
from typing import List, Dict, Any

class LLMHandler:
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
        else:
            self.model = None

    def is_configured(self):
        return self.model is not None

    def generate_questions(self, resume_text: str, role: str, difficulty: str, count: int = 3) -> List[Dict[str, Any]]:
        """
        Generates interview questions based on the resume using Gemini.
        Returns a list of structured question objects.
        """
        if not self.is_configured():
            return []

        prompt = f"""
        Act as a professional Interviewer for a {role} position.
        Analyze the following resume text and generate {count} {difficulty}-level interview questions.
        For each question, also provide "hints" or keys concepts the candidate should mention.
        
        Resume Content:
        {resume_text[:4000]} # Truncate to avoid limits if needed
        
        Return ONLY a raw JSON array (no markdown formatting) with this structure:
        [
            {{
                "question": "The question text",
                "type": "Technical/Behavioral/Project",
                "topic": "Topic Name",
                "hints": ["Hint 1", "Hint 2"]
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Clean response if it contains markdown code blocks
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
                
            return json.loads(text)
        except Exception as e:
            print(f"Error generating questions: {e}")
            return []

    def evaluate_answer(self, question: str, user_answer: str) -> Dict[str, Any]:
        """
        Evaluates a user's answer and provides feedback.
        """
        if not self.is_configured():
            return {"feedback": "LLM not configured.", "rating": 0}

        prompt = f"""
        You are an interviewer. 
        Question: "{question}"
        Candidate's Answer: "{user_answer}"
        
        Evaluate the answer. valid points, missing concepts, and improvement tips.
        Return ONLY a raw JSON object:
        {{
            "rating": <0-10 score integer>,
            "feedback": "Your constructive feedback here.",
            "better_answer": "An example of a stronger answer."
        }}
        """
        
        return self._generate_json(prompt)

    def analyze_jd_gap(self, resume_text: str, jd_text: str) -> Dict[str, Any]:
        """
        Analyzes the gap between Resume and Job Description.
        """
        if not self.is_configured(): return {}
        
        prompt = f"""
        Compare the Resume and Job Description (JD).
        Resume: {resume_text[:2000]}
        JD: {jd_text[:2000]}
        
        Identify 3 critical missing skills or gaps.
        Generate 3 interview questions regarding these gaps.
        
        Return ONLY JSON:
        {{
            "missing_skills": ["Skill1", "Skill2"],
            "analysis": "Brief analysis of fit.",
            "questions": [
                {{"question": "Q1 about missing skill", "type": "Gap Analysis", "topic": "Skill1"}},
                {{"question": "Q2 about missing skill", "type": "Gap Analysis", "topic": "Skill2"}}
            ]
        }}
        """
        return self._generate_json(prompt)

    def review_code(self, problem: str, user_code: str) -> Dict[str, Any]:
        """
        Reviews a coding solution.
        """
        if not self.is_configured(): return {}
        
        prompt = f"""
        Review this python code for the problem: "{problem}".
        User Code:
        {user_code}
        
        Analyze Time Complexity, Space Complexity, and Correctness.
        Return ONLY JSON:
        {{
            "is_correct": true/false,
            "rating": <0-10>,
            "feedback": "Code review comments.",
            "time_complexity": "O(n)",
            "optimized_code": "Better version if applicable"
        }}
        """
        return self._generate_json(prompt)

    def analyze_star(self, question: str, answer: str) -> Dict[str, Any]:
        """
        Checks if the answer follows STAR method.
        """
        if not self.is_configured(): return {}
        
        prompt = f"""
        Analyze if this answer follows S.T.A.R. (Situation, Task, Action, Result) format.
        Question: {question}
        Answer: {answer}
        
        Return ONLY JSON:
        {{
            "star_score": <0-10>,
            "missing_components": ["Result", "Action"],
            "feedback": "Feedback on structure."
        }}
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
