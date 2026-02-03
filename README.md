# AI Interview Question Generator

## Description
AI Interview Question Generator is a Python application that analyzes a candidate's resume (PDF or text) and generates role-specific interview questions. It uses NLP (spaCy, NLTK) and rule-based logic to extract skills, experience, projects, and technologies, then creates technical, behavioral, and project-based questions. The app simulates an interview flow, asking questions one by one, accepting typed answers, and supporting difficulty levels (Easy/Medium/Hard).

## Features
- **🎩 Professional UI**: Clean, modern "Video Call" aesthetic with a central AI avatar.
- **🤖 Gemini AI Integration**: Dynamic question generation & Answer Grading.
- **🗣️ Full Voice Conversation**:
    - **AI Speaks**: Text-to-Speech reads questions.
    - **You Speak**: Speech-to-Text listens to your answers (Recorder widget).
- **🔒 Secure Config**: Loads API keys from `.env` file.
- **Resume Parsing**: Deep analysis of skills and roles from PDF/TXT.
- **Question Logic**: Automatically falls back to rule-based engine if offline.
- **Export**: Downlad full transcripts.

## Installation Steps
1. Clone or download this repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up Configuration:
   - Copy `.env.example` to `.env`.
   - Open `.env` and paste your Google Gemini API Key.
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
4. Download NLP data (first run only):
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


