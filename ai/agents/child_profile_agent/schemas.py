from typing import List, Optional
from pydantic import BaseModel

class ChildProfileInput(BaseModel):
    age: int
    gender: Optional[str] = None
    interests: List[str] = []
    academic_level: Optional[str] = None

class ChildProfileOutput(BaseModel):
    anonymized_id: str
    skills: List[str]
    identified_needs: List[str]
