import streamlit as st
import os
import tempfile
from resume_parser import ResumeParser
from question_generator import QuestionGenerator

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
    Upload your resume and get role-specific interview questions with **answer keys**! 
    Prepare for your next job interview with confidence.
    """)

    # Sidebar
    st.sidebar.header("⚙️ Settings")
    difficulty = st.sidebar.select_slider(
        "Select Difficulty Level",
        options=["Easy", "Medium", "Hard"],
        value="Medium"
    )

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
                    
                    # Display Extracted Info (Collapsible)
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

                    # Generate Questions
                    st.divider()
                    st.header(f"📝 Generated Interview Questions ({difficulty})")
                    
                    qgen = QuestionGenerator(parsed_resume)
                    questions = qgen.generate_all_questions(difficulty)
                    
                    if not questions:
                        st.warning("Could not generate specific questions. Ensure your resume has clear 'Skills' or 'Projects' sections.")
                    else:
                        for i, q_data in enumerate(questions):
                            st.subheader(f"Q{i+1}: {q_data['question']}")
                            st.caption(f"Topic: {q_data.get('topic', 'General')} | Type: {q_data.get('type', 'General')}")
                            
                            # Answer Area
                            user_answer = st.text_area(f"Your Answer for Q{i+1}:", key=f"ans_{i}", height=100)
                            
                            # Hints / Answer Key
                            with st.expander("💡 Reveal Answer Key / Hints"):
                                if q_data.get('hints'):
                                    st.markdown("### Key Talking Points:")
                                    for hint in q_data['hints']:
                                        st.markdown(f"- {hint}")
                                else:
                                    st.info("No specific answer key available for this custom question.")
                            
                            st.divider()
                            
                except Exception as e:
                    st.error(f"An error occurred: {e}")
                    import traceback
                    st.code(traceback.format_exc())

    else:
        st.info("👆 Please upload a resume to start.")

if __name__ == "__main__":
    main()
