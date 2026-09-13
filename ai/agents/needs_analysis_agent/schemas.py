from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class NeedCategory(str, Enum):
    EDUCATION = "Education"
    HEALTHCARE = "Healthcare"
    MENTORSHIP = "Mentorship"
    NUTRITION = "Nutrition"
    OTHER = "Other"

class NeedUrgency(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class NeedItem(BaseModel):
    category: NeedCategory
    description: str = Field(..., min_length=2, max_length=250)
    urgency: NeedUrgency = NeedUrgency.MEDIUM
    reason: str = Field(..., min_length=5, max_length=500)

class NeedsAnalysisResult(BaseModel):
    needs: List[NeedItem]

class AnonymizedChildInput(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    educationLevel: Optional[str] = None
    interests: List[str] = []
    skills: List[str] = []
    aspirations: List[str] = []
    existingNeeds: List[dict] = []

