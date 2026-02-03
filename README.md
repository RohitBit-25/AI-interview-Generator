# AI Interview Question Generator

## Description
AI Interview Question Generator is a Python application that analyzes a candidate's resume (PDF or text) and generates role-specific interview questions. It uses NLP (spaCy, NLTK) and rule-based logic to extract skills, experience, projects, and technologies, then creates technical, behavioral, and project-based questions. The app simulates an interview flow, asking questions one by one, accepting typed answers, and supporting difficulty levels (Easy/Medium/Hard).

## Features
- **🤖 Animated AI Avatar**: Real-time talking avatar (Lottie Animations) coupled with Text-to-Speech.
- **📈 Progress Dashboard**: Track your interview performance, average ratings, and improvement over time with visual charts.
- **🎯 JD Gap Analysis**: Paste a Job Description to get custom questions focusing on your missing skills.
- **💻 Coding Arena**: Integrated Code Editor with AI-powered Code Review (Time Complexity & Correctness).
- **🗣️ Voice Conversation**: Full two-way voice interaction (Speak & Listen).
- **📄 PDF Report Cards**: Download a detailed performance review after each session.
- **🎩 Professional UI**: Clean, modern aesthetic with Sidebar navigation.
- **🔒 Secure Config**: Loads API keys from `.env` file.
- **Resume Parsing**: Deep analysis of skills and roles from PDF/TXT.
- **Auto-Fallback**: Works offline (rule-based) if no API key is provided.

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
Or use the helper script (Mac/Linux):
```bash
./run.sh
```

## Testing
To run the automated unit tests:
```bash
python run_tests.py
```


## Developer Guide
- `app.py`: Main Streamlit application entry point.
- `question_generator.py`: Logic for generating questions and answers.
- `utils.py`: Keyword databases and answer hint logic.
- `resume_parser.py`: Resume parsing logic.


