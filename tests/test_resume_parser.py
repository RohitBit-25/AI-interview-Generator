import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add parent directory to path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# --- MOCK SPACY BEFORE IMPORT ---
# Python 3.14 causes issues with Spacy/Pydantic v1.
# We mock spacy entirely so we don't need to install/load it for unit tests.
mock_spacy = MagicMock()
sys.modules["spacy"] = mock_spacy
sys.modules["pdfminer"] = MagicMock()
sys.modules["pdfminer.high_level"] = MagicMock()

# Now it is safe to import
from resume_parser import ResumeParser

class TestResumeParser(unittest.TestCase):
    def setUp(self):
        self.mock_text = """
        John Doe
        john.doe@example.com
        123-456-7890
        
        SKILLS
        Python, Java
        
        EXPERIENCE
        Software Engineer at Tech Corp.
        
        PROJECTS
        Developed a chatbot.
        """
        
        # Configure the global spacy mock to behave like a doc for extraction calls
        # When nlp(text) is called, it returns a doc
        self.mock_doc = MagicMock()
        mock_spacy.load.return_value = MagicMock(return_value=self.mock_doc)
        
        # Configure doc.sents to be a list of spans with .text
        # We need to manually simulate sentences for the tests that use nlp
        sent1 = MagicMock()
        sent1.text = "I have experience as a Software Engineer at Tech Corp."
        sent2 = MagicMock()
        sent2.text = "Developed a chatbot."
        self.mock_doc.sents = [sent1, sent2]

    @patch('resume_parser.ResumeParser._extract_text')
    def test_extract_skills(self, mock_extract):
        mock_extract.return_value = self.mock_text
        parser = ResumeParser("dummy.txt")
        skills = parser.extract_skills()
        
        self.assertIn('python', [s.lower() for s in skills])

    @patch('resume_parser.ResumeParser._extract_text')
    def test_extract_experience(self, mock_extract):
        mock_extract.return_value = self.mock_text
        # We need to make sure the specific instance 'nlp' call returns our configured doc
        # Since 'nlp' is a global in resume_parser, we need to inspect how it was initialized.
        # It was initialized at import time with mock_spacy.load(), which was already mocked.
        

        # Force the global nlp object in resume_parser to return our doc
        # We also need to re-mock it because during the test execution, the import might have happened differently
        import resume_parser
        resume_parser.nlp = MagicMock(return_value=self.mock_doc)
        
        parser = ResumeParser("dummy.txt")
        experience = parser.extract_experience()
        
        # Our mock setup has "Software Engineer..." as a sentence
        self.assertTrue(any("Software Engineer" in s for s in experience))

    @patch('resume_parser.ResumeParser._extract_text')
    def test_analyze_quality(self, mock_extract):
        mock_extract.return_value = self.mock_text
        parser = ResumeParser("dummy.txt")
        analysis = parser.analyze_quality()
        
        self.assertIn('score', analysis)
        self.assertTrue(analysis['score'] > 0)

if __name__ == '__main__':
    unittest.main()
