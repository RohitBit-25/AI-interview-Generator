import sys
import utils
from resume_parser import ResumeParser
from question_generator import QuestionGenerator
from interview_engine import InterviewEngine


def main():
    print("\n=== AI Interview Question Generator ===\n")
    resume_path = input("Enter the path to your resume (PDF or TXT): ").strip()
    if not utils.file_exists(resume_path):
        print("File not found. Please check the path and try again.")
        sys.exit(1)

    print("\nParsing resume...")
    parser = ResumeParser(resume_path)
    parsed = parser.parse()
    print("Extracted:")
    for k, v in parsed.items():
        print(f"  {k.capitalize()}: {', '.join(v) if v else 'None'}")

    print("\nSelect question difficulty:")
    print("1. Easy\n2. Medium\n3. Hard")
    diff_map = {'1': 'Easy', '2': 'Medium', '3': 'Hard'}
    diff_choice = input("Enter choice (1/2/3): ").strip()
    difficulty = diff_map.get(diff_choice, 'Easy')

    print(f"\nGenerating {difficulty} questions...")
    qgen = QuestionGenerator(parsed)
    questions = qgen.generate_all_questions(difficulty)
    if not questions:
        print("No questions could be generated from the resume. Please check the file.")
        sys.exit(1)

    engine = InterviewEngine(questions)
    engine.start()
    # Optionally, print answers at the end
    # print(engine.get_results())

if __name__ == "__main__":
    main()
