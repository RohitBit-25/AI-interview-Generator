import sqlite3
import datetime
import pandas as pd

class DBHandler:
    def __init__(self, db_name="interview.db"):
        self.db_name = db_name
        self.init_db()

    def init_db(self):
        """Initialize the SQLite database with tables."""
        conn = sqlite3.connect(self.db_name)
        c = conn.cursor()
        
        # Interactions Table (tracks every Q&A)
        c.execute('''
            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                role TEXT,
                difficulty TEXT,
                question TEXT,
                answer TEXT,
                feedback TEXT,
                rating INTEGER,
                type TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def save_interaction(self, session_id, role, difficulty, question, answer, feedback, rating, q_type="General"):
        """Save a single interaction result."""
        try:
            conn = sqlite3.connect(self.db_name)
            c = conn.cursor()
            c.execute('''
                INSERT INTO interactions (session_id, role, difficulty, question, answer, feedback, rating, type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (str(session_id), role, difficulty, question, answer, feedback, rating, q_type))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"DB Error: {e}")

    def get_analytics(self):
        """Fetch all data for analytics."""
        try:
            conn = sqlite3.connect(self.db_name)
            df = pd.read_sql_query("SELECT * FROM interactions", conn)
            conn.close()
            return df
        except Exception:
            return pd.DataFrame()
