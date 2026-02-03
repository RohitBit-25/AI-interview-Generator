import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import utils

class TestUtils(unittest.TestCase):
    def test_load_skill_keywords(self):
        skills = utils.load_skill_keywords()
        self.assertIsInstance(skills, list)
        self.assertIn('python', skills)

    def test_get_answer_hints(self):
        hints = utils.get_answer_hints('python')
        self.assertIsInstance(hints, list)
        self.assertTrue(len(hints) > 0)
        
        # Test fallback
        hints_fallback = utils.get_answer_hints('unknown_topic_123')
        self.assertTrue(len(hints_fallback) > 0)

    @patch('utils.FPDF')
    @patch('utils.tempfile.NamedTemporaryFile')
    def test_create_pdf_report(self, mock_temp, mock_fpdf):
        # Setup mocks
        mock_temp_file = MagicMock()
        mock_temp_file.name = "/tmp/test.pdf"
        mock_temp.return_value.__enter__.return_value = mock_temp_file
        
        mock_pdf_instance = MagicMock()
        mock_fpdf.return_value = mock_pdf_instance

        data = [{'question': 'Test Q', 'answer': 'Test A', 'rating': 8, 'feedback': 'Good'}]
        path = utils.create_pdf_report(90, ['Feedback1'], data)
        
        self.assertEqual(path, "/tmp/test.pdf")
        mock_pdf_instance.output.assert_called()

if __name__ == '__main__':
    unittest.main()
