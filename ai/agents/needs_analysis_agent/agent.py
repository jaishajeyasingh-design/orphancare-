"""
Needs Analysis Agent — Identifies critical support needs for anonymized child profiles.
"""
import os
import json
import urllib.request
import urllib.error
from .prompt import NEEDS_ANALYSIS_SYSTEM_PROMPT, build_user_prompt

class NeedsAnalysisAgent:
    def __init__(self):
        self.agent_name = "NeedsAnalysisAgent"
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
        self.model = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")

    def analyze_needs(self, profile_data: dict) -> dict:
        """
        Executes Needs Analysis on an anonymized child profile.
        Returns a dict containing {"needs": [...]}.
        """
        user_prompt = build_user_prompt(profile_data)
        
        if self.api_key:
            try:
                llm_response = self._call_gemini_api(user_prompt)
                if llm_response and "needs" in llm_response:
                    return llm_response
            except Exception as e:
                # Log error without leaking credentials or raw stack traces
                print(f"[NeedsAnalysisAgent] LLM API Call failed, falling back to rule engine: {str(e)}")
        
        # Rule-based Needs Analysis Engine Fallback
        return self._rule_based_fallback(profile_data)

    def _call_gemini_api(self, user_prompt: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{NEEDS_ANALYSIS_SYSTEM_PROMPT}\n\n{user_prompt}"}]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode("utf-8"))
            content_text = result["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(content_text)

    def _rule_based_fallback(self, profile_data: dict) -> dict:
        needs = []
        interests = [i.lower() for i in profile_data.get("interests", [])]
        skills = [s.lower() for s in profile_data.get("skills", [])]
        aspirations = [a.lower() for a in profile_data.get("aspirations", [])]
        age = profile_data.get("age", 10)

        # Education & Mentorship Needs
        if any(term in interests or term in aspirations for term in ["coding", "programming", "software", "tech", "computer"]):
            needs.append({
                "category": "Education",
                "description": "Programming & Technology Mentorship",
                "urgency": "High",
                "reason": "The child shows an active interest or career aspiration in software engineering and technology."
            })
            needs.append({
                "category": "Other",
                "description": "Access to a Computer & Coding Tools",
                "urgency": "Medium",
                "reason": "Hands-on computer access is required to support the child's technology learning goals."
            })

        if any(term in interests or term in aspirations for term in ["science", "doctor", "medical", "math", "engineering"]):
            needs.append({
                "category": "Education",
                "description": "STEM Academic Tutoring & Learning Materials",
                "urgency": "High",
                "reason": "STEM subject tutoring will help the child build foundational academic skills for their career goals."
            })

        if any(term in interests or term in aspirations for term in ["art", "music", "drawing", "sports", "football"]):
            needs.append({
                "category": "Other",
                "description": "Extracurricular Supplies & Skill Coaching",
                "urgency": "Low",
                "reason": "Supporting extracurricular passions fosters holistic personal growth and confidence."
            })

        # General Age-Based Healthcare/Nutrition Baseline Needs
        if age < 14:
            needs.append({
                "category": "Healthcare",
                "description": "Routine Pediatric Health & Dental Assessment",
                "urgency": "Medium",
                "reason": "Regular preventive healthcare checks support healthy developmental milestones."
            })
        
        if not needs:
            needs.append({
                "category": "Mentorship",
                "description": "General Academic & Life Skills Mentorship",
                "urgency": "Medium",
                "reason": "Personal guidance helps vulnerable youth navigate education and skill development."
            })

        return {"needs": needs}

