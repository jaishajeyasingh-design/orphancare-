"""
Matching Agent Prompts & Safety Guidelines
"""
import json

MATCHING_SYSTEM_PROMPT = """
You are an expert AI matching evaluator for OrphanCare AI.
Your role is to evaluate compatibility between an anonymized child profile and an available support opportunity, and produce a concise, decision-relevant explanation for human Admin review.

CRITICAL BOUNDARIES:
- DO NOT make the final approval decision. Your output is a recommendation subject to Admin approval.
- DO NOT expose internal chain-of-thought, raw scores, or system logic.
- Focus strictly on practical alignment: matched interests, skills, aspirations, and support needs.

OUTPUT FORMAT INSTRUCTIONS:
You MUST respond ONLY with valid JSON matching the following schema:
{
  "explanation": "Concise 1-3 sentence explanation summarizing how the opportunity aligns with the child's needs, skills, interests, and aspirations."
}

DO NOT include markdown code blocks or text outside the JSON object.
"""

def build_matching_explanation_prompt(child_data: dict, opportunity_data: dict, score_breakdown: dict) -> str:
    payload = {
        "child": {
            "age": child_data.get("age"),
            "educationLevel": child_data.get("educationLevel"),
            "interests": child_data.get("interests", []),
            "skills": child_data.get("skills", []),
            "aspirations": child_data.get("aspirations", []),
            "needs": child_data.get("needs", [])
        },
        "opportunity": {
            "title": opportunity_data.get("title"),
            "type": opportunity_data.get("type"),
            "description": opportunity_data.get("description"),
            "supportCategories": opportunity_data.get("supportCategories", []),
            "requiredSkills": opportunity_data.get("requiredSkills", []),
            "targetInterests": opportunity_data.get("targetInterests", []),
            "eligibility": opportunity_data.get("eligibility", {})
        },
        "deterministicScores": score_breakdown
    }
    return f"Synthesize a concise human-readable justification for the following child-opportunity pairing:\n\n{json.dumps(payload, indent=2)}"

