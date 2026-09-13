# Needs Analysis Agent

Analyzes anonymized child development profiles to identify and prioritize support needs across Education, Healthcare, Mentorship, Nutrition, and Extracurricular/Equipment dimensions.

## Safety & Boundaries
- Strictly operates on anonymized child profile attributes (`age`, `gender`, `educationLevel`, `interests`, `skills`, `aspirations`, `existingNeeds`).
- Never processes PII (name, address, shelter location).
- Prohibited from issuing medical diagnoses, legal/adoption decisions, or sensitive attribute inferences.

## Input Schema
```json
{
  "age": 12,
  "gender": "Female",
  "educationLevel": "Grade 7",
  "interests": ["Coding", "Chess"],
  "skills": ["Scratch"],
  "aspirations": ["Software Engineer"],
  "existingNeeds": []
}
```

## Output Schema
```json
{
  "needs": [
    {
      "category": "Education",
      "description": "Programming Mentorship",
      "urgency": "High",
      "reason": "The child shows active interest in programming and software engineering career aspirations."
    }
  ]
}
```

## Environment Configuration
- `AI_API_KEY` / `GEMINI_API_KEY`: API key for Gemini LLM provider.
- `DEFAULT_MODEL`: Default model (`gemini-2.5-flash`).
- Fallback: Automatically uses built-in rule engine when no API key is provided or network fails.

