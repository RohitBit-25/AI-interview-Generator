import random
from typing import List, Dict
import utils
import nltk

nltk.download('punkt', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

class QuestionGenerator:
    def __init__(self, parsed_resume: Dict[str, List[str]]):
        self.skills = parsed_resume.get('skills', [])
        self.experience = parsed_resume.get('experience', [])
        self.projects = parsed_resume.get('projects', [])
        self.technologies = parsed_resume.get('technologies', [])
        self.roles = parsed_resume.get('roles', [])

    def generate_technical_questions(self, difficulty: str) -> List[Dict]:
        questions = []
        for skill in self.skills:
            hints = utils.get_answer_hints(skill)
            if difficulty == 'Easy':
                questions.append({
                    "question": f"What is {skill} and why is it used?",
                    "type": "Technical",
                    "topic": skill,
                    "hints": hints
                })
            elif difficulty == 'Medium':
                questions.append({
                    "question": f"How have you applied {skill} in your previous projects? Can you give a specific example?",
                    "type": "Technical",
                    "topic": skill,
                    "hints": hints
                })
            elif difficulty == 'Hard':
                questions.append({
                    "question": f"Describe a complex challenge you faced when working with {skill} and how you resolved it.",
                    "type": "Technical",
                    "topic": skill,
                    "hints": hints
                })
        
        # Avoid duplicate tech questions if coverd in skills
        processed_techs = set(self.skills)
        for tech in self.technologies:
            if tech in processed_techs:
                continue
            hints = utils.get_answer_hints(tech)
            if difficulty == 'Easy':
                 questions.append({
                    "question": f"Explain the basic concepts of {tech}.",
                    "type": "Technical",
                    "topic": tech,
                    "hints": hints
                })
            elif difficulty == 'Medium':
                 questions.append({
                    "question": f"Compare {tech} with its main alternatives. Why would you choose one over the other?",
                    "type": "Technical",
                    "topic": tech,
                    "hints": hints
                })
            elif difficulty == 'Hard':
                 questions.append({
                    "question": f"Discuss an advanced feature or optimization technique in {tech}.",
                    "type": "Technical",
                    "topic": tech,
                    "hints": hints
                })
        return questions

    def generate_behavioral_questions(self, difficulty: str) -> List[Dict]:
        templates = {
            'Easy': [
                {"q": "Tell me about yourself and your background.", "h": ["Elevator pitch", "Current role", "Key achievements"]},
                {"q": "What motivates you to work in this field?", "h": ["Passion for technology", "Solving problems", "Impact"]}
            ],
            'Medium': [
                {"q": "Describe a time you had to work with a difficult team member.", "h": ["STAR method (Situation, Task, Action, Result)", "Empathy", "Communication"]},
                {"q": "How do you handle tight deadlines or pressure?", "h": ["Prioritization", "Communication", "Focus"]}
            ],
            'Hard': [
                {"q": "Tell me about a significant failure you experienced. What did you learn?", "h": ["Honesty", "Growth mindset", "Resilience"]},
                {"q": "Describe a situation where you had to lead a team through uncertainty.", "h": ["Leadership style", "Decision making", "Communication"]}
            ]
        }
        
        selected = templates.get(difficulty, [])
        return [{
            "question": item['q'],
            "type": "Behavioral",
            "topic": "Behavioral",
            "hints": item['h']
        } for item in selected]

    def generate_project_questions(self, difficulty: str) -> List[Dict]:
        questions = []
        for project in self.projects:
            # Clean project name slightly
            proj_name = project[:60] + "..." if len(project) > 60 else project
            if difficulty == 'Easy':
                questions.append({
                    "question": f"Can you give a high-level overview of your project: '{proj_name}'?",
                    "type": "Project",
                    "topic": "Project Experience",
                    "hints": ["Goal of the project", "Your role", "Technologies used"]
                })
            elif difficulty == 'Medium':
                questions.append({
                    "question": f"What specific technologies did you choose for '{proj_name}' and why?",
                    "type": "Project",
                    "topic": "Project Experience",
                    "hints": ["Technical decision making", "Trade-offs", "Alternative considered"]
                })
            elif difficulty == 'Hard':
                questions.append({
                    "question": f"What was the most significant technical hurdle you overcame in '{proj_name}'?",
                    "type": "Project",
                    "topic": "Project Experience",
                    "hints": ["Problem definition", "Debugging process", "Solution implementation"]
                })
        return questions

    def generate_all_questions(self, difficulty: str) -> List[Dict]:
        questions = []
        questions.extend(self.generate_technical_questions(difficulty))
        questions.extend(self.generate_behavioral_questions(difficulty))
        questions.extend(self.generate_project_questions(difficulty))
        random.shuffle(questions)
        return questions
