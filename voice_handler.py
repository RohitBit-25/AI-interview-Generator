from gtts import gTTS
import os
import tempfile
import speech_recognition as sr

class VoiceHandler:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    def generate_audio(self, text: str, lang='en') -> str:
        """
        Generates an audio file from text using gTTS.
        Returns the path to the temporary audio file.
        """
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            # Create a temp file
            # We use delete=False so we can close it and let Streamlit read it, 
            # but we need to manage cleanup manually if we want to be strict.
            # In Streamlit, usually temp files are okay for the session.
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
                tts.save(fp.name)
                return fp.name
        except Exception as e:
            print(f"Error generating audio: {e}")
            return None

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribes audio file to text using Google Speech Recognition.
        """
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio_data = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio_data)
                return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError as e:
            return f"Could not request results; {e}"
        except Exception as e:
            return f"Error transcribing: {e}"
