import re
from typing import List, Dict, Any
from pdfminer.high_level import extract_text
import spacy

nlp = spacy.load('en_core_web_sm')

class ResumeParser:
    def __init__(self, resume_path: str):
        self.resume_path = resume_path
        self.text = self._extract_text()

    def _extract_text(self) -> str:
        if self.resume_path.lower().endswith('.pdf'):
            return extract_text(self.resume_path)
        elif self.resume_path.lower().endswith('.txt'):
            with open(self.resume_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError('Unsupported file format. Use PDF or TXT.')

    def extract_skills(self) -> List[str]:
        # Simple rule-based extraction using common skill keywords
        skill_keywords = utils.load_skill_keywords()
        found_skills = set()
        for skill in skill_keywords:
            if re.search(r'\b' + re.escape(skill) + r'\b', self.text, re.IGNORECASE):
                found_skills.add(skill)
        return list(found_skills)

    def extract_experience(self) -> List[str]:
        # Extract experience sentences using regex and NLP
        experience = []
        doc = nlp(self.text)
        for sent in doc.sents:
            if re.search(r'(\bexperience\b|\bworked at\b|\bposition\b|\brole\b|\bcompany\b)', sent.text, re.IGNORECASE):
                experience.append(sent.text.strip())
        return experience

    def extract_projects(self) -> List[str]:
        # Look for project sections or keywords
        projects = []
        doc = nlp(self.text)
        for sent in doc.sents:
            if re.search(r'(project|developed|built|created|designed)', sent.text, re.IGNORECASE):
                projects.append(sent.text.strip())
        return projects

    def extract_technologies(self) -> List[str]:
        # Use a list of common technologies
        tech_keywords = utils.load_technology_keywords()
        found_tech = set()
        for tech in tech_keywords:
            if re.search(r'\b' + re.escape(tech) + r'\b', self.text, re.IGNORECASE):
                found_tech.add(tech)
        return list(found_tech)

    def extract_role_based_info(self):
         # Heuristic to guess role from resume
         roles = self.extract_roles()
         return roles[0] if roles else "General"

    def analyze_quality(self) -> Dict[str, Any]:
        """
        Analyzes the resume for structure and content quality.
        Returns a score (0-100) and feedback.
        """
        score = 100
        feedback = []
        
        # 1. content length check
        word_count = len(self.text.split())
        if word_count < 200:
            score -= 20
            feedback.append("Resume is too short (< 200 words). Add more details.")
        elif word_count > 2000:
            score -= 10
            feedback.append("Resume might be too long (> 2000 words). Consider summarizing.")

        # 2. Section Checks
        if not self.extract_skills():
            score -= 20
            feedback.append("No explicit 'Skills' detected. Make sure to list your technical skills.")
        
        # Simple heuristic for experience/projects presence
        has_experience = len(self.extract_experience()) > 0
        has_projects = len(self.extract_projects()) > 0
        
        if not has_experience:
            score -= 15
            feedback.append("Limited 'Experience' detected. Highlight your work history.")
        
        if not has_projects:
            score -= 10
            feedback.append("No 'Projects' detected. Adding projects can boost your profile.")

        # 3. Contact Info Check (Basic Regex)
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'\b(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})\b'
        
        has_email = re.search(email_pattern, self.text)
        has_phone = re.search(phone_pattern, self.text)

        if not has_email:
            score -= 5
            feedback.append("No Email address detected.")
        if not has_phone:
            score -= 5
            feedback.append("No Phone number detected.")

        return {
            "score": max(0, score),
            "feedback": feedback
        }

    def extract_roles(self) -> List[str]:
        # Use a list of common roles
        role_keywords = utils.load_role_keywords()
        found_roles = set()
        for role in role_keywords:
            if re.search(r'\b' + re.escape(role) + r'\b', self.text, re.IGNORECASE):
                found_roles.add(role)
        return list(found_roles)

    def parse(self) -> Dict[str, List[str]]:
        return {
            'skills': self.extract_skills(),
            'experience': self.extract_experience(),
            'projects': self.extract_projects(),
            'technologies': self.extract_technologies(),
            'roles': self.extract_roles(),
        }

import utils
