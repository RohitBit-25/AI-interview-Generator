import streamlit as st
import os
import tempfile
import pandas as pd
from streamlit_lottie import st_lottie
from streamlit_mic_recorder import mic_recorder
from streamlit_ace import st_ace

from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from llm_handler import LLMHandler
from voice_handler import VoiceHandler
from db_handler import DBHandler
import utils
import config

st.set_page_config(page_title="AI Career Prep Platform", page_icon="🚀", layout="wide")

# Validates and loads config
API_KEY = config.Config.get_api_key()

# Initialize Handlers
llm = LLMHandler(API_KEY)
voice = VoiceHandler()
db = DBHandler()

# Custom CSS
# Custom CSS - Premium UI
st.markdown("""
<style>
    /* Import Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* Main Background */
    .stApp {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 1px solid #e2e8f0;
    }

    /* Card Styling */
    .card {
        background: white !important;
        padding: 24px;
        border-radius: 16px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        margin-bottom: 24px;
        transition: transform 0.2s ease-in-out;
    }
    .card:hover {
        transform: translateY(-2px);
    }
    
    /* Typography */
    h1, h2, h3 {
        color: #1e293b !important;
        font-weight: 800;
        letter-spacing: -0.025em;
    }
    
    /* Buttons */
    .stButton button {
        background: linear-gradient(to right, #2563eb, #3b82f6) !important;
        color: white !important;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton button:hover {
        background: linear-gradient(to right, #1d4ed8, #2563eb) !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        transform: scale(1.02);
    }
    
    /* Metrics */
    div[data-testid="stMetricValue"] {
        font-size: 2.5rem;
        font-weight: 800;
        color: #2563eb !important;
    }
    
    /* Inputs */
    .stTextArea textarea {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        padding: 1rem;
    }
    .stTextArea textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    /* Status Messages */
    .stSuccess {
        background-color: #f0fdf4 !important;
        border-left: 4px solid #22c55e !important;
    }
    .stInfo {
        background-color: #eff6ff !important;
        border-left: 4px solid #3b82f6 !important;
    }
</style>
""", unsafe_allow_html=True)

def save_uploaded_file(uploaded_file):
    try:
        suffix = os.path.splitext(uploaded_file.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            return tmp_file.name
    except Exception as e:
        st.error(f"Error saving file: {e}")
        return None

# --- UI SECTIONS ---

def render_dashboard():
    st.header("📈 Progress Dashboard")
    df = db.get_analytics()
    
    if df.empty:
        st.info("No interview sessions recorded yet. Start an interview to see analytics!")
        return

    # metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Questions Answered", len(df))
    with col2:
        if 'rating' in df.columns:
            avg_score = df[df['rating'] > 0]['rating'].mean()
            st.metric("Average AI Rating", f"{avg_score:.1f}/10" if pd.notna(avg_score) else "N/A")
        else:
            st.metric("Average AI Rating", "N/A")
    with col3:
        st.metric("Sessions Completed", df['session_id'].nunique() if 'session_id' in df.columns else 0)

    # Recent History
    st.subheader("Recent Activity")
    if not df.empty:
        cols_to_show = ['timestamp', 'role', 'type', 'question', 'rating']
        # Filter existing cols
        existing_cols = [c for c in cols_to_show if c in df.columns]
        st.dataframe(df.sort_values('timestamp', ascending=False).head(10)[existing_cols], use_container_width=True)

    # Chart
    st.subheader("Performance Trend")
    if len(df) > 1 and 'rating' in df.columns:
        # Simple moving average if possible, or just raw
        chart_data = df.groupby('timestamp')['rating'].mean()
        st.line_chart(chart_data)

def render_coding_arena():
    st.header("💻 Coding Arena")
    st.markdown("Practice technical coding problems with AI Code Review.")
    
    if not API_KEY:
        st.warning("⚠️ Coding Arena requires Gemini API Key to function.")
        # Allow demo but warn
    
    # Select Problem
    problem = st.selectbox("Select Challenge", [
        "Reverse a Linked List", 
        "Two Sum Problem", 
        "Valid Palindrome", 
        "Merge Sorted Array",
        "Design a Singleton Class"
    ])
    
    st.info(f"**Task**: Write Python code to solve: {problem}")
    
    # Editor
    code = st_ace(language='python', theme='monokai', height=300, key="code_editor")
    
    if st.button("🚀 Submit Code"):
        if not API_KEY:
            st.error("Please configure GEMINI_API_KEY in .env first.")
            return

        with st.spinner("AI is reviewing your code..."):
            review = llm.review_code(problem, code)
            st.divider()
            
            # Display Results
            c1, c2 = st.columns(2)
            with c1:
                st.metric("Correctness", "Pass" if review.get('is_correct') else "Fail")
            with c2:
                st.metric("Code Quality Rating", f"{review.get('rating')}/10")
            
            st.subheader("Feedback")
            st.write(review.get('feedback'))
            
            st.subheader("Complexity Analysis")
            st.write(f"**Time**: {review.get('time_complexity')}")

def render_interview_mode(mode="Standard"):
    # Session State Init
    if 'questions' not in st.session_state: st.session_state.questions = []
    if 'curr_idx' not in st.session_state: st.session_state.curr_idx = 0
    if 'session_id' not in st.session_state: st.session_state.session_id = pd.Timestamp.now().strftime('%Y%m%d%H%M%S')
    if 'interactions' not in st.session_state: st.session_state.interactions = []

    # --- SETUP PHASE ---
    if not st.session_state.questions:
        st.markdown(f"### Setup: {mode} Interview")
        
        # JD Input for Gap Mode
        jd_text = ""
        if mode == "JD Matcher":
            jd_text = st.text_area("Paste Job Description used for Gap Analysis:")
        
        if st.button("Start Interview"):
            if not st.session_state.get('resume_text'):
                st.error("Please upload resume in Sidebar first!")
                return

            with st.spinner("Preparing Interview..."):
                if mode == "JD Matcher" and API_KEY:
                    analysis = llm.analyze_jd_gap(st.session_state.resume_text, jd_text)
                    st.session_state.questions = analysis.get('questions', [])
                    st.session_state.gap_analysis = analysis.get('analysis')
                else:
                    # Standard / Fallback
                    role = st.session_state.get('role', 'Candidate')
                    if API_KEY:
                        st.session_state.questions = llm.generate_questions(st.session_state.resume_text, role, "Medium")
                    else:
                        qgen = QuestionGenerator(st.session_state.parsed_resume)
                        st.session_state.questions = qgen.generate_all_questions("Medium")
            st.rerun()
            
    # --- INTERVIEW LOOP ---
    else:
        q_list = st.session_state.questions
        idx = st.session_state.curr_idx
        
        if idx < len(q_list):
            q_item = q_list[idx]
            q_text = q_item['question']
            
            # 1. Avatar Animation
            col_av, col_q = st.columns([1, 2])
            with col_av:
                if st.session_state.get('enable_voice'):
                    # Use a Lottie for 'Talking AI' - Placeholder URL
                    lottie_url = "https://lottie.host/5a8b7926-068a-40a2-ae31-31420786576b/2pX5y8wN5w.json" # Robot
                    lottie_json = utils.load_lottie_url(lottie_url)
                    if lottie_json:
                        st_lottie(lottie_json, height=200, key=f"avatar_{idx}")
                    else:
                        st.image("https://api.dicebear.com/7.x/avataaars/svg?seed=Robot", width=150)
                    
                    # Audio Autoplay
                    audio_path = voice.generate_audio(q_text)
                    if audio_path:
                        st.audio(audio_path, format="audio/mp3", start_time=0)

            with col_q:
                st.markdown(f"""<div class="card">
                <h4 style="color:#64748b">Question {idx+1}/{len(q_list)}</h4>
                <h3 style="color:#1e293b">{q_text}</h3>
                </div>""", unsafe_allow_html=True)
            
            # 2. Answer Input
            st.write("🎙️ **Your Response**")
            tab1, tab2 = st.tabs(["TEXT", "VOICE"])
            
            with tab2:
                audio = mic_recorder(start_prompt="Record Answer", stop_prompt="Stop", key=f"rec_{idx}")
                if audio and f"trans_{idx}" not in st.session_state:
                    text = voice.transcribe_audio(audio['bytes'])
                    st.session_state[f"trans_{idx}"] = text
                    st.success("Transcribed!")
            
            with tab1:
                def_val = st.session_state.get(f"trans_{idx}", "")
                ans = st.text_area("Type Answer", value=def_val, height=150, key=f"ans_{idx}")
            
            # 3. Actions
            c1, c2 = st.columns([1, 4])
            with c1:
                if st.button("Submit & Next ➡️", type="primary"):
                    # ALways Evaluate if Key present
                    rating = 0
                    feedback = ""
                    if API_KEY and ans:
                        eval_res = llm.evaluate_answer(q_text, ans)
                        rating = eval_res.get('rating', 0)
                        feedback = eval_res.get('feedback', '')
                    
                    # Save to DB
                    db.save_interaction(
                        st.session_state.session_id, 
                        st.session_state.get('role', 'General'), 
                        "Medium", q_text, ans, feedback, rating, 
                        q_item.get('type', mode)
                    )
                    
                    # Save to Session
                    st.session_state.interactions.append({
                        "question": q_text, "answer": ans, 
                        "rating": rating, "feedback": feedback
                    })
                    
                    st.session_state.curr_idx += 1
                    st.rerun()

        else:
            # End Screen
            st.success("🎉 Interview Complete!")
            
            # PDF Report
            if st.button("📄 Generate Report Card"):
                pdf_path = utils.create_pdf_report(
                    st.session_state.get('resume_score', 0), 
                    st.session_state.get('resume_feedback', []), 
                    st.session_state.interactions
                )
                with open(pdf_path, "rb") as f:
                    st.download_button("Download PDF", f, file_name="Interview_Report.pdf")

            if st.button("Start New Session"):
                st.session_state.questions = []
                st.session_state.curr_idx = 0
                st.rerun()

# --- MAIN APP SHELL ---
def main():
    # Sidebar Navigation
    with st.sidebar:
        st.image("https://cdn-icons-png.flaticon.com/512/4712/4712009.png", width=50)
        st.title("CareerPrep AI")
        
        mode = st.radio("Navigation", ["Dashboard", "Interview Mode", "Coding Arena"])
        
        st.divider()
        st.session_state.enable_voice = st.toggle("Enable Voice Avatar", value=True)
        
        st.divider()
        # File Upload Logic Here (Global)
        uploaded_file = st.file_uploader("📂 Update Resume", type=["pdf", "txt"])
        if uploaded_file:
            path = save_uploaded_file(uploaded_file)
            parser = ResumeParser(path)
            st.session_state.parsed_resume = parser.parse()
            st.session_state.resume_text = parser.text
            st.session_state.role = parser.extract_role_based_info()
            
            # Quick Score
            analysis = parser.analyze_quality()
            st.session_state.resume_score = analysis['score']
            st.session_state.resume_feedback = analysis['feedback']
            st.success("Resume Loaded!")
            os.unlink(path)

    # Main Router
    if mode == "Dashboard":
        render_dashboard()
    elif mode == "Coding Arena":
        render_coding_arena()
    elif mode == "Interview Mode":
        mode_type = st.selectbox("Interview Type", ["Standard", "JD Matcher", "STAR Coach"])
        render_interview_mode(mode_type)

if __name__ == "__main__":
    main()
