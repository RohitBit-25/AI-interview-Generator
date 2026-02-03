from typing import List, Dict, Any, Union

class InterviewEngine:
    def __init__(self, questions: List[Union[str, Dict[str, Any]]]):
        self.questions = questions
        self.answers = []
        self.current = 0

    def start(self):
        print("\n--- AI Interview Simulation ---\n")
        while self.current < len(self.questions):
            q_item = self.questions[self.current]
            q_text = q_item['question'] if isinstance(q_item, dict) else q_item
            
            print(f"Q{self.current+1}: {q_text}")
            if isinstance(q_item, dict) and 'hints' in q_item:
                 # Optional: Hint option in CLI? Maybe just skip for now to keep it simple, or print hints if requested.
                 pass

            answer = input("Your answer: ")
            self.answers.append({'question': q_text, 'answer': answer})
            self.current += 1
        print("\nInterview complete! Thank you for participating.\n")

    def get_results(self):
        return self.answers
