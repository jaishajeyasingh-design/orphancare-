# AI Architecture — OrphanCare AI

## Modular Agents Layout

Each agent operates within `ai/agents/{agent_name}/`:
- `agent.py`: Agent execution engine & lifecycle
- `prompt.py`: System prompt definitions & context templates
- `schemas.py`: Input/Output Pydantic/JSON validation schemas
- `service.py`: Client wrapper invoking backend LLM models
- `README.md`: Agent documentation & usage guidelines

## AI Agent Directory
1. **Child Profile Agent**: Extracts structured attributes & safeguards sensitive PII.
2. **Needs Analysis Agent**: Evaluates child skill gaps, health requirements, and educational milestones.
3. **Opportunity Agent**: Catalogues and categorizes external sponsorships and volunteer offers.
4. **Matching Agent**: Performs multi-factor alignment between child needs and donor/volunteer capabilities.
5. **Development Plan Agent**: Formulates step-by-step quarterly goals for children.
6. **Impact Agent**: Computes long-term outcomes and quantifies social impact.
