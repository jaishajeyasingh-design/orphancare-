from pydantic import BaseModel

class DevelopmentPlanInput(BaseModel):
    child_id: str

class DevelopmentPlanOutput(BaseModel):
    plan_id: str
    milestones: list
