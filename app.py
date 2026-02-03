import streamlit as st
import os
import tempfile
from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from llm_handler import LLMHandler
from voice_handler import VoiceHandler

st.set_page_config(page_title="AI Interview Assistant", page_icon="📝", layout="wide")

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
    st.title("🤖 AI Interview Assistant")
    st.markdown("""
    Upload your resume and get role-specific interview questions.
    Now with **Gemini AI** support for dynamic questions and **Voice Mode**!
    """)

    # Sidebar
    st.sidebar.header("⚙️ Settings")
    
    # API Key Input
    api_key = st.sidebar.text_input("🔑 Gemini API Key (Optional)", type="password", help="Enter your Google Gemini API Key for advanced features.")
    
    # Difficulty
    difficulty = st.sidebar.select_slider(
        "Select Difficulty Level",
        options=["Easy", "Medium", "Hard"],
        value="Medium"
    )
    
    # Voice Mode
    enable_voice = st.sidebar.toggle("Enable Voice Mode (AI Avatar)")
    
    if enable_voice:
        persona = st.sidebar.selectbox("Interviewer Persona", ["Professional HR", "Tech Lead", "Friendly Recruiter"])
        st.sidebar.image("https://api.dicebear.com/7.x/avataaars/svg?seed=" + persona, width=100, caption=f"Your Interviewer: {persona}")

    # File Uploader
    uploaded_file = st.file_uploader("Upload Resume (PDF or TXT)", type=["pdf", "txt"])

    if uploaded_file is not None:
        # Save file temporarily
        temp_path = save_uploaded_file(uploaded_file)
        
        if temp_path:
            with st.spinner("Analyzing Resume..."):
                try:
                    # Parse Resume
                    parser = ResumeParser(temp_path)
                    parsed_resume = parser.parse()
                    
                    # Cleanup temp file
                    os.unlink(temp_path)
                    
                    # --- RESUME ANALYSIS SIDEBAR ---
                    st.sidebar.divider()
                    st.sidebar.subheader("📊 Resume Score")
                    
                    # Analyze Quality
                    analysis = parser.analyze_quality()
                    score = analysis['score']
                    
                    # Display Circular Progress or Bar
                    if score >= 80:
                         st.sidebar.success(f"Excellent! {score}/100")
                    elif score >= 50:
                         st.sidebar.warning(f"Good, but needs work. {score}/100")
                    else:
                         st.sidebar.error(f"Needs Improvement. {score}/100")
                    
                    st.sidebar.progress(score / 100)
                    
                    if analysis['feedback']:
                        with st.sidebar.expander("Improvement Tips"):
                            for tip in analysis['feedback']:
                                st.write(f"- {tip}")

                    # --- DETAILED PARSING ---
                    with st.expander("📄 Parsed Resume Details", expanded=False):
                        col1, col2 = st.columns(2)
                        with col1:
                            st.subheader("Skills Found")
                            st.write(", ".join(parsed_resume.get('skills', []) or ["None detected"]))
                            st.subheader("Roles Detected")
                            st.write(", ".join(parsed_resume.get('roles', []) or ["None detected"]))
                        with col2:
                            st.subheader("Technologies")
                            st.write(", ".join(parsed_resume.get('technologies', []) or ["None detected"]))
                            st.subheader("Project Keywords")
                            st.write(f"Found related keywords in {len(parsed_resume.get('projects', []))} sections.")

                    # --- QUESTION GENERATION ---
                    st.divider()
                    st.header(f"📝 Generated Interview Questions ({difficulty})")
                    
                    questions = []
                    
                    # Initialize Handlers
                    llm = LLMHandler(api_key)
                    voice = VoiceHandler()

                    # Check if we should use LLM or fallback
                    if api_key:
                        with st.spinner("🤖 Gemini is generating custom questions..."):
                            role = parser.extract_role_based_info()
                            questions = llm.generate_questions(parser.text, role, difficulty)
                            if not questions:
                                st.error("Gemini failed to generate questions. Falling back to rule-based engine.")
                    
                    # Fallback if LLM setup failed or no key
                    if not questions:
                        qgen = QuestionGenerator(parsed_resume)
                        questions = qgen.generate_all_questions(difficulty)
                    
                    # Store answers for export
                    if 'interview_log' not in st.session_state:
                         st.session_state.interview_log = {}

                    if not questions:
                        st.warning("Could not generate specific questions. Ensure your resume has clear 'Skills' or 'Projects' sections.")
                    else:
                        full_transcript = f"AI Interview Session - {difficulty} Level\n\n"
                        
                        for i, q_data in enumerate(questions):
                            st.subheader(f"Q{i+1}: {q_data['question']}")
                            st.caption(f"Topic: {q_data.get('topic', 'General')} | Type: {q_data.get('type', 'General')}")
                            
                            # Voice Playback
                            if enable_voice:
                                audio_path = voice.generate_audio(q_data['question'])
                                if audio_path:
                                    st.audio(audio_path, format="audio/mp3")
                            
                            # Answer Area
                            user_ans = st.text_area(f"Your Answer for Q{i+1}:", key=f"ans_{i}", height=100)
                            
                            # LLM Feedback Button
                            if api_key and user_ans:
                                if st.button(f"✨ Evaluate Answer Q{i+1}", key=f"eval_{i}"):
                                    with st.spinner("Gemini is evaluating your answer..."):
                                        eval_result = llm.evaluate_answer(q_data['question'], user_ans)
                                        st.markdown(f"**Rating:** {eval_result.get('rating', 0)}/10")
                                        st.info(f"**Feedback:** {eval_result.get('feedback', 'No feedback')}")
                                        with st.expander("View Improved Answer"):
                                            st.write(eval_result.get('better_answer', 'N/A'))
                                        
                                        # Add evaluation to transcript
                                        full_transcript += f"  [AI Evaluation]: {eval_result.get('feedback', '')} (Rating: {eval_result.get('rating')})\n"

                            # Update Transcript
                            full_transcript += f"Q{i+1}: {q_data['question']}\n"
                            full_transcript += f"Your Answer: {user_ans if user_ans else '(No Answer)'}\n"
                            
                            # Hints / Answer Key (Static Fallback if LLM present but hints are in data)
                            with st.expander("💡 Reveal Answer Key / Hints"):
                                if q_data.get('hints'):
                                    st.markdown("### Key Talking Points:")
                                    for hint in q_data['hints']:
                                        st.markdown(f"- {hint}")
                                        full_transcript += f"  - Hint: {hint}\n"
                                else:
                                    st.info("No specific answer key available.")
                            
                            full_transcript += "-" * 40 + "\n\n"
                            st.divider()
                        
                        # --- EXPORT BUTTON ---
                        st.download_button(
                            label="📥 Download Interview Transcript",
                            data=full_transcript,
                            file_name="interview_transcript.txt",
                            mime="text/plain"
                        )
                            
                except Exception as e:
                    st.error(f"An error occurred: {e}")
                    import traceback
                    st.code(traceback.format_exc())

    else:
        st.info("👆 Please upload a resume to start.")


if __name__ == "__main__":
    main()
