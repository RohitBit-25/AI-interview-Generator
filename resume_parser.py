import re
from typing import List, Dict
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
