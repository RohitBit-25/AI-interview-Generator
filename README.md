# AI Interview Question Generator

## Description
AI Interview Question Generator is a Python application that analyzes a candidate's resume (PDF or text) and generates role-specific interview questions. It uses NLP (spaCy, NLTK) and rule-based logic to extract skills, experience, projects, and technologies, then creates technical, behavioral, and project-based questions. The app simulates an interview flow, asking questions one by one, accepting typed answers, and supporting difficulty levels (Easy/Medium/Hard).

## Features
- Upload a resume (PDF or text)
- Parse and extract skills, experience, projects, and technologies
- Generate technical, behavioral, and project-based questions
- Simulate an interview: ask questions, accept answers, move to next
- Select question difficulty: Easy, Medium, Hard
- 100% Python, no paid APIs

## Resume Upload Instructions
- Place your resume file (PDF or .txt) in the project directory
- When prompted, enter the filename (e.g., `resume.pdf` or `resume.txt`)

## How Interview Simulation Works
1. The app parses your resume and generates a set of questions
2. Questions are asked one by one in the terminal
3. Type your answer and press Enter to proceed
4. Continue until all questions are answered

## Installation Steps
1. Clone or download this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Download NLTK data (first run only):
   ```python
   python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger')"
   ```
4. Download spaCy model (first run only):
   ```python
   python -m spacy download en_core_web_sm
   ```

## How to Run
```bash
python main.py
```

## How to Fork and Extend
- Add new question templates in `question_generator.py`
- Improve resume parsing logic in `resume_parser.py`
- Extend interview flow in `interview_engine.py`
- Add more NLP features in `utils.py`

## Developer credit
Developer: tubakhxn
