from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class GoalStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In_Progress"
    ACHIEVED = "Achieved"

class GoalItem(BaseModel):
    description: str = Field(..., min_length=2, max_length=250)
    targetWeeks: Optional[int] = Field(default=4, ge=1, le=52)
    status: GoalStatus = GoalStatus.PENDING

class DevelopmentPlanResult(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    goals: List[GoalItem]

class DevelopmentPlanInput(BaseModel):
    child: Dict
    approved_opportunities: List[Dict] = []

