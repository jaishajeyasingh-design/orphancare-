from pydantic import BaseModel

class MatchRequest(BaseModel):
    child_id: str
    donor_or_opportunity_id: str

class MatchResponse(BaseModel):
    match_score: float
    reasoning: str
