"""
AI Service Configuration Setup
"""
import os

class AIConfig:
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
    API_KEY = os.getenv("AI_API_KEY", "")
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")
    TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))

config = AIConfig()
