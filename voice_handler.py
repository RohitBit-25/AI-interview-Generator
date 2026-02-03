from gtts import gTTS
import os
import tempfile

class VoiceHandler:
    def __init__(self):
        pass

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
