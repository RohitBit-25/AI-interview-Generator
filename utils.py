import os
import requests
import json
from fpdf import FPDF
import tempfile

def load_lottie_url(url: str):
    """Load Lottie animation from URL."""
    try:
        r = requests.get(url)
        if r.status_code != 200:
            return None
        return r.json()
    except:
        return None

def create_pdf_report(resume_score, feedback, interview_data):
    """
    Generates a PDF report card.
    interview_data: List of dicts {question, answer, rating, feedback}
    """
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "AI Interview Performance Report", ln=True, align="C")
    
    pdf.set_font("Arial", "", 12)
    pdf.ln(10)
    pdf.cell(0, 10, f"Resume Score: {resume_score}/100", ln=True)
    
    if feedback:
        pdf.ln(5)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Resume Feedback:", ln=True)
        pdf.set_font("Arial", "", 10)
        for item in feedback:
             pdf.multi_cell(0, 6, f"- {item}")
    
    pdf.ln(10)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Interview Details", ln=True)
    
    for i, data in enumerate(interview_data):
        pdf.set_font("Arial", "B", 11)
        pdf.ln(5)
        # Handle unicode issues with latin-1 in fpdf by encoding/decoding or replacing
        q_text = f"Q{i+1}: {data.get('question', '')}".encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 6, q_text)
        
        pdf.set_font("Arial", "", 10)
        ans_text = f"Your Answer: {data.get('answer', '')}".encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 6, ans_text)
        
        rating = data.get('rating', 'N/A')
        fb_text = f"Rating: {rating}/10 | Feedback: {data.get('feedback', '')}".encode('latin-1', 'replace').decode('latin-1')
        pdf.set_text_color(100, 100, 100)
        pdf.multi_cell(0, 6, fb_text)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        return tmp.name

def load_skill_keywords():
    # Expanded list of common skills
    return [
        'python', 'java', 'c++', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin',
        'machine learning', 'deep learning', 'nlp', 'computer vision', 'data analysis', 'data science',
        'project management', 'agile', 'scrum', 'kanban', 'jira', 'confluence',
        'sql', 'nosql', 'postgresql', 'mysql', 'mongodb', 'redis', 'cassandra', 'elasticsearch',
        'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd',
        'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring boot',
        'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
        'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
        'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking', 'time management'
    ]

def load_technology_keywords():
    return load_skill_keywords()  # They overlap significantly

def load_role_keywords():
    return [
        'software engineer', 'data scientist', 'product manager', 'project manager',
        'devops engineer', 'frontend developer', 'backend developer', 'full stack developer',
        'mobile developer', 'qa engineer', 'ui/ux designer', 'business analyst',
        'machine learning engineer', 'data engineer', 'cloud architect'
    ]

def get_answer_hints(topic):
    """
    Returns a list of key points (hints) for a given topic/skill.
    This acts as a basic 'Answer Key' database.
    """
    hints = {
        'python': [
            "Interpreted, high-level, general-purpose programming language.",
            "Supports multiple paradigms: procedural, object-oriented, functional.",
            "Key libraries: NumPy, Pandas, Django, Flask.",
            "Features: List comprehensions, decorators, generators, contest managers."
        ],
        'java': [
            "Class-based, object-oriented, designed to have few implementation dependencies.",
            "JVM (Java Virtual Machine) allows 'write once, run anywhere'.",
            "Key concepts: OOP principles (Inheritance, Polymorphism), Multithreading, Garbage Collection.",
            "Popular frameworks: Spring Boot, Hibernate."
        ],
        'javascript': [
            "High-level, just-in-time compiled language that conforms to the ECMAScript specification.",
            "Multi-paradigm: event-driven, functional, imperative.",
            "Key concepts: Closures, Promises, Async/Await, DOM manipulation.",
            "Ecosystem: npm, React, Vue, Node.js."
        ],
        'react': [
            "JavaScript library for building user interfaces.",
            "Component-based architecture.",
            "Key concepts: Virtual DOM, JSX, Hooks (useState, useEffect), Props vs State."
        ],
        'sql': [
            "Structured Query Language for managing relational databases.",
            "Key commands: SELECT, INSERT, UPDATE, DELETE.",
            "Concepts: Joins (Inner, Left, Right), Indexes, Normalization, ACID properties."
        ],
        'machine learning': [
            "Subset of AI focused on building systems that learn from data.",
            "Types: Supervised (Classification, Regression), Unsupervised (Clustering), Reinforcement Learning.",
            "Key concepts: Overfitting/Underfitting, Bias-Variance Tradeoff, Feature Engineering."
        ],
        'docker': [
            "Platform for developing, shipping, and running applications in containers.",
            "Key concepts: Images vs Containers, Dockerfile, Docker Compose.",
            "Benefits: Consistency across environments, isolation, portability."
        ],
         'aws': [
            "Amazon Web Services - cloud computing platform.",
            "Core services: EC2 (Compute), S3 (Storage), RDS (Database), Lambda (Serverless).",
            "Concepts: VPC, IAM, Auto-scaling, Load Balancing."
        ]
    }
    # Return specific hints or generic ones if not found
    return hints.get(topic.lower(), [
        f"Discuss your experience with {topic}.",
        f"Mention specific projects where you used {topic}.",
        "Explain the core benefits and drawbacks.",
        "Relate it to the job requirements."
    ])

def file_exists(filepath):
    return os.path.isfile(filepath)
