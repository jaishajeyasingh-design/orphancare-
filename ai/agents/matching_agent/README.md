# Matching Agent

Synthesizes concise, explainable justifications for recommended matches between anonymized child profiles and support opportunities for human Admin review.

## Matching Strategy
Uses a **Hybrid Architecture**:
1. **Deterministic Eligibility Filtering**: Verifies age, education level, and opportunity status (`Open`).
2. **Multi-Factor Scoring Engine**:
   - Need Alignment (35%)
   - Skill Alignment (25%)
   - Interest Alignment (20%)
   - Aspiration Alignment (15%)
   - Eligibility Fit (5%)
3. **AI Justification Synthesis**: Produces a concise 1-3 sentence explanation summarizing how the opportunity fulfills the child's specific needs, skills, and goals.

## Output Schema
```json
{
  "explanation": "The 'Python Mentorship' opportunity directly addresses the child's programming mentorship need and aligns with their interest in coding and career aspiration as a software developer."
}
```

