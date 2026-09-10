from pydantic import BaseModel

class OpportunityInput(BaseModel):
    title: str
    description: str
    type: str

class OpportunityOutput(BaseModel):
    opportunity_id: str
    tags: list
