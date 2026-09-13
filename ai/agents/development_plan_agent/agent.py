"""
Development Plan Agent — Generates structured, milestone-driven growth plans for children.
"""
import os
import json
import urllib.request
import urllib.error
from .prompt import DEVELOPMENT_PLAN_SYSTEM_PROMPT, build_development_plan_prompt

class DevelopmentPlanAgent:
    def __init__(self):
        self.agent_name = "DevelopmentPlanAgent"
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
        self.model = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")

    def create_plan(self, child_data: dict, approved_opportunities: list = None) -> dict:
        """
        Generates a milestone-driven growth plan for an anonymized child profile.
        Returns {"title": "...", "goals": [...]}.
        """
        approved_opps = approved_opportunities or []
        prompt = build_development_plan_prompt(child_data, approved_opps)

        if self.api_key:
            try:
                llm_response = self._call_gemini_api(prompt)
                if llm_response and "title" in llm_response and "goals" in llm_response:
                    return llm_response
            except Exception as e:
                print(f"[DevelopmentPlanAgent] LLM API Call failed, falling back to rule engine: {str(e)}")

        return self._rule_based_fallback(child_data, approved_opps)

    def _call_gemini_api(self, prompt_text: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{DEVELOPMENT_PLAN_SYSTEM_PROMPT}\n\n{prompt_text}"}]
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

    def _rule_based_fallback(self, child_data: dict, approved_opportunities: list) -> dict:
        aspirations = child_data.get("aspirations", [])
        aspiration_title = aspirations[0] if aspirations else "Skill Development"
        title = f"{aspiration_title.strip().title()} Growth Plan"

        goals = []
        interests = [i.lower() for i in child_data.get("interests", [])]
        skills = [s.lower() for s in child_data.get("skills", [])]
        needs = child_data.get("needs", [])

        # Milestone 1: Core Fundamentals
        primary_interest = child_data.get("interests", ["academic subjects"])[0]
        goals.append({
            "description": f"Strengthen fundamentals in {primary_interest} and core academic subjects",
            "targetWeeks": 4,
            "status": "Pending"
        })

        # Milestone 2: Applied Project or Skill Milestone
        primary_skill = child_data.get("skills", [primary_interest])[0]
        goals.append({
            "description": f"Complete hands-on practical project applying {primary_skill} skills",
            "targetWeeks": 8,
            "status": "Pending"
        })

        # Milestone 3: Opportunity Engagement
        if approved_opportunities:
            opp_title = approved_opportunities[0].get("title", "matched support program")
            goals.append({
                "description": f"Participate consistently in '{opp_title}' and track progress with mentor",
                "targetWeeks": 12,
                "status": "Pending"
            })
        else:
            goals.append({
                "description": "Engage in weekly structured mentorship sessions and skill workshops",
                "targetWeeks": 12,
                "status": "Pending"
            })

        # Milestone 4: Independent Demonstration
        goals.append({
            "description": f"Present completed growth portfolio toward career goal of becoming a {aspiration_title}",
            "targetWeeks": 16,
            "status": "Pending"
        })

        return {
            "title": title,
            "goals": goals
        }

