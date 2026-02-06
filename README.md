# KAUSHAL.AI // Next-Gen Interview Intelligence

<div align="center">
  <br />
  <img src="https://img.shields.io/badge/Status-Online-00f3ff?style=for-the-badge&logo=dependabot" alt="Status Online" />
  <img src="https://img.shields.io/badge/Theme-Cyberpunk-7000ff?style=for-the-badge&logo=cyberpunk" alt="Theme Cyberpunk" />
  <img src="https://img.shields.io/badge/Engine-LLM_Powered-ffe600?style=for-the-badge&logo=openai" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Stack-Next.js_FastAPI-000000?style=for-the-badge&logo=next.js" alt="Tech Stack" />
  <br />
  <br />
  <p align="center">
    <b>A High-Fidelity, AI-Powered Technical Interview Simulator.</b><br />
    <i>"Where Preparation Meets The Future."</i>
  </p>
</div>

---

## 🔮 Overview

**Kaushal.ai** disrupts the traditional mock interview space by replacing boring forms with a **Immersive Command Center**. It isn't just a Q&A bot; it's a full-stack simulation platform that assesses candidates across three dimensions: **Voice Confidence**, **Technical Knowledge**, and **Coding Proficiency**.

Built with a **Cyberpunk/Sci-Fi design system**, it treats interview preparation like a high-stakes mission, complete with real-time feedback, detailed analytics, and a "Coding Arena" for live execution.

---

## ⚡ Key Capabilities

### 1. 🧠 Intelligent Interview Core
*   **Resume Parsing**: Auto-detects your role (e.g., "React Developer", "Data Scientist"), skills, and experience level from a PDF upload using NLP.
*   **Adaptive Questioning**: Powered by **Groq LPU (Llama-3)**, questions evolve dynamically. Answer well? The AI drills deeper. Struggle? It pivots to fundamentals.
*   **Voice Interface**: Real-time Speech-to-Text and Text-to-Speech for a natural, hands-free conversation flow.

### 2. ⚔️ The Coding Arena
*   **Integrated IDE**: A robust code editor with syntax highlighting and line numbers.
*   **Live Execution Engine**: Features the **Piston API** to run Python code directly in the browser.
*   **Real-time Output**: View `stdout`, `stderr`, and execution time instantly—no more "pretend" coding.
*   **AI Review**: Instant feedback on Time Complexity (Big O) and Code Quality.

### 3. 📊 Command Center Dashboard
*   **Readiness Index**: A calculated score (0-100%) indicating probability of passing a real interview.
*   **Skill Matrix**: Radar charts visualizing strengths vs. weaknesses (e.g., "Strong in Algorithms, Weak in System Design").
*   **Gamification**: Earn "Elite Tier" badges, track daily streaks, and view mission logs.

### 4. 📄 comprehensive Reporting
*   **PDF Generation**: One-click download of a professional "Candidate Summary Report" for offline review.
*   **Session Ops**: Detailed history of every Q&A pair with AI-generated feedback.

---

## 🏗️ System Architecture

### 📂 Directory Structure
```
kaushal-ai/
├── backend/                 # Python FastAPI Server
│   ├── interview.db         # SQLite Database (Interactions & Analytics)
│   ├── server.py            # API Entry Point
│   ├── llm_handler.py       # Groq/AI Logic
│   ├── voice_handler.py     # Speech Processing
│   └── ...
├── frontend/                # Next.js 14 Application
│   ├── app/                 # App Router Pages (Dashboard, Arena, Interview)
│   ├── components/ui/       # Shadcn UI + Cyberpunk Customizations
│   ├── public/              # Static Assets
│   └── ...
└── ...
```

### 🛠️ Tech Stack

| Component      | Technology         | Purpose                                   |
| :------------- | :----------------- | :---------------------------------------- |
| **Frontend**   | **Next.js 14**     | App Router, Server Components, React 19   |
| **Styling**    | **Tailwind CSS**   | Styling, Custom Animations, Glassmorphism |
| **Animations** | **Framer Motion**  | Page Transitions, Micro-interactions      |
| **Backend**    | **FastAPI**        | High-performance Python API               |
| **AI / LLM**   | **Groq (Llama-3)** | Ultra-low latency inference               |
| **Database**   | **SQLite**         | Local persistence of sessions/stats       |
| **Execution**  | **Piston API**     | Remote Code Execution Sandbox             |
| **Reporting**  | **FPDF2**          | PDF Report Generation                     |

---

## 🚀 Installation & Setup

### Prerequisites
*   **Node.js 18+**
*   **Python 3.10+** (Virtual Environment recommended)
*   **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/kaushal-ai.git
cd kaushal-ai
```

### 2. Backend Configuration
Navigate to the backend, set up the environment, and install dependencies.

```bash
cd backend
python -m venv venv
# Activate Venv
source venv/bin/activate  # Mac/Linux
# .\venv\Scripts\activate  # Windows

# Install Libs
pip install -r requirements.txt
pip install fpdf2 requests
```

**Environment Variables**:
Create a `.env` file in the `backend/` directory:
```bash
# backend/.env
GROQ_API_KEY=gsk_your_actual_key_here_xxxxxxxxxxxx
```

**Start Server**:
```bash
uvicorn server:app --reload --port 8000
```
*The API will be live at `http://localhost:8000/docs` (Swagger UI available)*

### 3. Frontend Configuration
Open a new terminal and navigate to the frontend folder.

```bash
cd frontend
npm install
```

**Start Client**:
```bash
npm run dev
```
*The App will be live at `http://localhost:3000`*

---

## 🔌 API Reference (Key Endpoints)

| Method | Endpoint               | Description                                           |
| :----- | :--------------------- | :---------------------------------------------------- |
| `POST` | `/api/upload`          | Upload PDF Resume & extract text/skills               |
| `POST` | `/api/interview/start` | Initialize interview & generate first question        |
| `POST` | `/api/interview/next`  | Submit answer & get AI feedback + next question       |
| `POST` | `/api/arena/run`       | Execute Python code in sandbox (Standard Output)      |
| `POST` | `/api/arena/submit`    | Submit final code for AI Review (Complexity Analysis) |
| `GET`  | `/api/report/pdf`      | Download Session Report as PDF                        |
| `GET`  | `/api/dashboard`       | Fetch user analytics and stats                        |

---

## 🔮 Roadmap

- [x] **Phase 1**: Core Interview Logic (Voice & Text)
- [x] **Phase 2**: Coding Arena & Dashboard (Cyberpunk UI)
- [x] **Phase 3**: Advanced Integrations (PDF Reports, Real Code Execution)
- [ ] **Phase 4 (Future)**: 
    - [ ] **Multi-Language Support**: Java/C++ in Arena
    - [ ] **Authentication**: Clerk/NextAuth for User Accounts
    - [ ] **Team Mode**: Multiplayer Mock Interviews

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <br />
  <p><i>OPERATIVE_STATUS: ONLINE // SYSTEM_READY</i></p>
  <p>Built with 💻 & ☕ by <b>Kaushal.ai Team</b></p>
</div>
