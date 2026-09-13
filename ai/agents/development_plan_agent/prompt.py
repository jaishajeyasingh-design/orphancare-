"""
Development Plan Agent Prompts & Safety Guidelines
"""
import json

DEVELOPMENT_PLAN_SYSTEM_PROMPT = """
You are an expert AI youth growth & career development strategist for OrphanCare AI.
Your role is to formulate a milestone-driven, independence-oriented growth plan for a child based on their anonymized profile, aspirations, skills, interests, needs, and approved opportunities.

CRITICAL SAFETY & BOUNDARIES:
- DO NOT generate shelter routine or chore checklists. Focus on long-term skill acquisition, education, and career aspirations.
- DO NOT make medical or psychological diagnoses.
- DO NOT make legal, adoption, custody, or placement decisions.
- DO NOT infer highly sensitive personal or discriminatory attributes.

OUTPUT FORMAT INSTRUCTIONS:
You MUST respond ONLY with valid JSON matching the following schema:
{
  "title": "A concise, motivating title for the plan (e.g., 'Software Development Growth Plan')",
  "goals": [
    {
      "description": "Clear, actionable milestone goal description",
      "targetWeeks": 4,
      "status": "Pending"
    }
  ]
}

- `status` MUST be one of: "Pending", "In_Progress", "Achieved" (default to "Pending").
- Provide 3 to 5 realistic, sequential goals with target completion timeframes in weeks (e.g. 4, 8, 12, 16).
- DO NOT include markdown code blocks or text outside the JSON object.
"""

def build_development_plan_prompt(child_data: dict, approved_opportunities: list) -> str:
    anonymized_payload = {
        "age": child_data.get("age"),
        "educationLevel": child_data.get("educationLevel"),
        "interests": child_data.get("interests", []),
        "skills": child_data.get("skills", []),
        "aspirations": child_data.get("aspirations", []),
        "needs": child_data.get("needs", []),
        "approvedOpportunities": [
            {
              "title": o.get("title"),
              "type": o.get("type"),
              "description": o.get("description")
            } for o in approved_opportunities
        ]
    }
    return f"Synthesize a personalized, milestone-driven growth plan for the following child profile:\n\n{json.dumps(anonymized_payload, indent=2)}"

