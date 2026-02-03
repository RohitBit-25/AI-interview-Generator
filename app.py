import streamlit as st
import os
import tempfile
from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from llm_handler import LLMHandler
from voice_handler import VoiceHandler
import config
from streamlit_mic_recorder import mic_recorder

st.set_page_config(page_title="AI Interview Pro", page_icon="👔", layout="wide")

# Validates and loads config
API_KEY = config.Config.get_api_key()

def save_uploaded_file(uploaded_file):
    try:
        suffix = os.path.splitext(uploaded_file.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            return tmp_file.name
    except Exception as e:
        st.error(f"Error saving file: {e}")
        return None

def main():
    # --- Custom CSS for Professional Look ---
    st.markdown("""
        <style>
        .stApp { background-color: #f5f7fa; }
        .main-header { font-size: 2.5rem; color: #1e3a8a; font-weight: 800; text-align: center; margin-bottom: 2rem; }
        .avatar-container { display: flex; justify-content: center; margin: 20px 0; }
        .avatar-img { border-radius: 50%; border: 4px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 200px; height: 200px; object-fit: cover; }
        .question-box { background-color: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border-left: 5px solid #3b82f6; margin-bottom: 20px; }
        .question-text { font-size: 1.5rem; color: #1f2937; font-weight: 600; }
        .status-bar { padding: 10px; background: #e5e7eb; border-radius: 8px; margin-bottom: 10px; font-size: 0.9rem; text-align: center; }
        </style>
        """, unsafe_allow_html=True)

    st.markdown('<div class="main-header">Professional AI Interviewer</div>', unsafe_allow_html=True)

    # Sidebar Settings
    with st.sidebar:
        st.header("⚙️ Configuration")
        
        # API Key Management
        user_api_key = st.text_input("Gemini API Key", value=API_KEY if API_KEY else "", type="password", placeholder="Loaded from .env" if API_KEY else "Enter Key")
        final_api_key = user_api_key if user_api_key else API_KEY
        
        if final_api_key:
            st.success("API Key Active")
        else:
            st.warning("Running in Offline Mode (Basic)")

        difficulty = st.select_slider("Difficulty", options=["Easy", "Medium", "Hard"], value="Medium")
        
        st.divider()
        enable_voice = st.toggle("Enable Voice Mode", value=True)
        persona = st.selectbox("Interviewer Persona", ["Professional HR", "Tech Lead", "Friendly Recruiter"])
    
    # Initialize Handlers
    llm = LLMHandler(final_api_key)
    voice = VoiceHandler()

    # --- SESSION STATE MANAGEMENT ---
    if 'resume_parsed' not in st.session_state:
        st.session_state.resume_parsed = False
    if 'current_question_idx' not in st.session_state:
        st.session_state.current_question_idx = 0
    if 'questions' not in st.session_state:
        st.session_state.questions = []
    if 'answers' not in st.session_state:
        st.session_state.answers = {}

    # File Uploader Container
    if not st.session_state.resume_parsed:
        col1, col2 = st.columns([1, 2])
        with col2:
            st.info("👋 Welcome! Upload your resume to begin the interview session.")
            uploaded_file = st.file_uploader("Upload Resume (PDF/TXT)", type=["pdf", "txt"])
            
            if uploaded_file:
                temp_path = save_uploaded_file(uploaded_file)
                if temp_path:
                    with st.spinner("Analyzing profile..."):
                        parser = ResumeParser(temp_path)
                        st.session_state.parsed_resume = parser.parse()
                        st.session_state.role = parser.extract_role_based_info()
                        st.session_state.resume_text = parser.text
                        st.session_state.resume_parsed = True
                        os.unlink(temp_path)
                        st.rerun()

    else:
        # --- INTERVIEW STAGE ---
        
        # 1. Generate Questions (Once)
        if not st.session_state.questions:
            with st.spinner(f"Generating custom questions for {st.session_state.role}..."):
                if final_api_key:
                    st.session_state.questions = llm.generate_questions(st.session_state.resume_text, st.session_state.role, difficulty)
                
                # Fallback
                if not st.session_state.questions:
                    qgen = QuestionGenerator(st.session_state.parsed_resume)
                    st.session_state.questions = qgen.generate_all_questions(difficulty)
        
        questions = st.session_state.questions
        curr_idx = st.session_state.current_question_idx
        
        # Layout
        col_main, col_info = st.columns([2, 1])
        
        with col_main:
            # Avatar Display
            avatar_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={persona}&backgroundColor=b6e3f4"
            st.markdown(f'<div class="avatar-container"><img src="{avatar_url}" class="avatar-img"></div>', unsafe_allow_html=True)
            
            if curr_idx < len(questions):
                q_data = questions[curr_idx]
                
                # Question Card
                st.markdown(f"""
                <div class="question-box">
                    <div style="color: #6b7280; font-size: 0.9em; margin-bottom: 5px;">Question {curr_idx + 1} of {len(questions)}</div>
                    <div class="question-text">{q_data['question']}</div>
                </div>
                """, unsafe_allow_html=True)
                
                # Auto-play Audio
                if enable_voice:
                     # Unique key ensures it doesn't replay on interact
                    audio_path = voice.generate_audio(q_data['question'])
                    if audio_path:
                        st.audio(audio_path, format="audio/mp3", start_time=0)

                # Answer Section
                st.markdown("### 🎙️ Your Answer")
                
                # Two input methods: Voice or Text
                input_tab, voice_tab = st.tabs(["✍️ Text Input", "🎤 Voice Recording"])
                
                with voice_tab:
                    st.info("Click the microphone to start recording. Click again to stop.")
                    audio_blob = mic_recorder(start_prompt="Start Recording", stop_prompt="Stop Recording", key=f"recorder_{curr_idx}")
                    
                    if audio_blob and f"transcribed_{curr_idx}" not in st.session_state:
                         st.info("Transcribing audio...")
                         text = voice.transcribe_audio(audio_blob['bytes'])
                         st.session_state[f"transcribed_{curr_idx}"] = text
                    
                    # Display Info if transcribed
                    if f"transcribed_{curr_idx}" in st.session_state:
                         st.success("Transcribed: " + st.session_state[f"transcribed_{curr_idx}"])

                with input_tab:
                    # Pre-fill with transcribed text if available
                    default_ans = st.session_state.get(f"transcribed_{curr_idx}", "")
                    user_ans = st.text_area("Type or Edit Answer:", value=default_ans, height=150, key=f"ans_area_{curr_idx}")

                # Actions
                col_actions1, col_actions2 = st.columns(2)
                
                with col_actions1:
                    if final_api_key and user_ans:
                         if st.button("✨ Analyze My Answer", key=f"eval_{curr_idx}"):
                              with st.spinner("Analyzing..."):
                                   eval_res = llm.evaluate_answer(q_data['question'], user_ans)
                                   st.markdown(f"**Rating:** {eval_res.get('rating')}/10")
                                   st.info(eval_res.get('feedback'))

                with col_actions2:
                     if st.button("Next Question ➡️", type="primary", key=f"next_{curr_idx}"):
                          # Save Answer
                          st.session_state.answers[curr_idx] = user_ans
                          st.session_state.current_question_idx += 1
                          st.rerun()

            else:
                st.success("🎉 Interview Completed!")
                st.balloons()
                # Export logic would go here

        with col_info:
            st.subheader("Your Profile")
            st.caption(f"Role: {st.session_state.role}")
            st.divider()
            
            # Progress
            progress = (curr_idx / len(questions))
            st.progress(progress, text=f"Progress: {int(progress*100)}%")
            
            # Hints
            if curr_idx < len(questions):
                if st.button("💡 Show Hint"):
                     hints = questions[curr_idx].get('hints', [])
                     for h in hints:
                          st.write(f"- {h}")



if __name__ == "__main__":
    main()
