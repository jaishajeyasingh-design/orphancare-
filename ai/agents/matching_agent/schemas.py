from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class MatchCandidateInput(BaseModel):
    child: Dict
    opportunity: Dict
    score_breakdown: Optional[Dict] = None

class MatchExplanationResult(BaseModel):
    explanation: str = Field(..., min_length=5, max_length=1000)

