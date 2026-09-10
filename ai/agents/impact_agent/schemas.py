from pydantic import BaseModel

class ImpactRequest(BaseModel):
    timeframe: str

class ImpactResponse(BaseModel):
    total_children_impacted: int
    impact_score: float
