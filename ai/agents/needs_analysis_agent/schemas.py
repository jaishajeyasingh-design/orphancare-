from pydantic import BaseModel
from typing import List

class NeedsAnalysisRequest(BaseModel):
    child_id: str

class NeedsAnalysisResponse(BaseModel):
    child_id: str
    categorized_needs: List[dict]
