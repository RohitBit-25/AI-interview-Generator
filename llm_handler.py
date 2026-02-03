import google.generativeai as genai
import json
from typing import List, Dict, Any

class LLMHandler:
    def __init__(self, api_key: str):
        self.api_key = api_key
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
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
            "rating": <0-10 score>,
            "feedback": "Your constructive feedback here.",
            "better_answer": "An example of a stronger answer."
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
            return json.loads(text)
        except Exception as e:
             return {"feedback": f"Error evaluating: {e}", "rating": 0}
