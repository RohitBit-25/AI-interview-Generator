# AI Interview Question Generator

## Description
AI Interview Question Generator is a Python application that analyzes a candidate's resume (PDF or text) and generates role-specific interview questions. It uses NLP (spaCy, NLTK) and rule-based logic to extract skills, experience, projects, and technologies, then creates technical, behavioral, and project-based questions. The app simulates an interview flow, asking questions one by one, accepting typed answers, and supporting difficulty levels (Easy/Medium/Hard).

## Features
- **Interactive Web Interface**: Built with Streamlit for a smooth user experience.
- **🤖 Gemini AI Integration**: Uses Google's Gemini Pro to generate custom questions and evaluate your answers *in real-time*.
- **🗣️ Voice Mode & Avatars**: Choose an interviewer persona (HR, Tech Lead) and hear them ask questions aloud.
- **Resume Parsing**: Upload PDF or TXT files to extract skills, experience, and projects.
- **Resume Score**: Get immediate feedback on your resume's structure and completeness.
- **Answer Assistant**: Generates detailed answer keys and talking points.
- **Transcript Export**: Download your full interview session for review.
- **Privacy First**: All processing happens locally (unless using Gemini API); no data files are uploaded to the cloud by us.

## Installation Steps
1. Clone or download this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: Requires `ffmpeg` installed on your system if you encounter audio issues, though gTTS usually works standalone.*
3. Download NLP data (first run only):
   ```python
   python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger')"
   python -m spacy download en_core_web_sm
   ```

## How to Run
Run the Streamlit app:
```bash
streamlit run app.py
```
(Prop tip: The old CLI version is still available via `python main.py`)

## Developer Guide
- `app.py`: Main Streamlit application entry point.
- `question_generator.py`: Logic for generating questions and answers.
- `utils.py`: Keyword databases and answer hint logic.
- `resume_parser.py`: Resume parsing logic.


