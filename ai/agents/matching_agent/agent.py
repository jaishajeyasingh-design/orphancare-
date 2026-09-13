"""
Matching Agent — Synthesizes concise justifications for child-opportunity pairings.
"""
import os
import json
import urllib.request
import urllib.error
from .prompt import MATCHING_SYSTEM_PROMPT, build_matching_explanation_prompt

class MatchingAgent:
    def __init__(self):
        self.agent_name = "MatchingAgent"
        self.api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
        self.model = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")

    def generate_explanation(self, child_data: dict, opportunity_data: dict, score_breakdown: dict) -> dict:
        """
        Synthesizes a concise human-readable explanation for a matched child and opportunity.
        Returns {"explanation": "..."}.
        """
        prompt = build_matching_explanation_prompt(child_data, opportunity_data, score_breakdown)

        if self.api_key:
            try:
                llm_response = self._call_gemini_api(prompt)
                if llm_response and "explanation" in llm_response:
                    return llm_response
            except Exception as e:
                print(f"[MatchingAgent] LLM API Call failed, falling back to rule generator: {str(e)}")

        return self._rule_based_explanation(child_data, opportunity_data, score_breakdown)

    def _call_gemini_api(self, prompt_text: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": f"{MATCHING_SYSTEM_PROMPT}\n\n{prompt_text}"}]
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

    def _rule_based_explanation(self, child: dict, opp: dict, breakdown: dict) -> dict:
        opp_title = opp.get("title", "Opportunity")
        matched_items = []

        interests = [i.lower() for i in child.get("interests", [])]
        skills = [s.lower() for s in child.get("skills", [])]
        aspirations = [a.lower() for a in child.get("aspirations", [])]
        needs = child.get("needs", [])

        # Check matched needs
        need_categories = [n.get("category", "").lower() for n in needs]
        opp_categories = [c.lower() for c in opp.get("supportCategories", [])] + [opp.get("type", "").lower()]

        if any(c in opp_categories for c in need_categories):
            matched_items.append("directly addresses identified support needs")

        # Check matched skills/interests/aspirations
        opp_skills = [s.lower() for s in opp.get("requiredSkills", [])]
        opp_interests = [i.lower() for i in opp.get("targetInterests", [])]

        if any(s in skills for s in opp_skills) or any(i in interests for i in opp_interests):
            matched_items.append("matches the child's demonstrated skills and interests")

        if any(a in opp_title.lower() or any(a in i for i in opp_interests) for a in aspirations):
            matched_items.append("supports future career aspirations")

        if not matched_items:
            matched_items.append("aligns with general developmental requirements")

        explanation = f"The '{opp_title}' opportunity {', '.join(matched_items)}."
        return {"explanation": explanation}

