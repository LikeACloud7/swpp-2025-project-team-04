from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from ..level_management.models import CEFRLevel
from .interests import InterestKey


class UserInterest(BaseModel):
    key: InterestKey
    category: str
    label: str

    class Config:
        orm_mode = True


class UpdateUserInterestsRequest(BaseModel):
    interests: List[InterestKey] = Field(default_factory=list)


class UpdateUserInterestsResponse(BaseModel):
    interests: List[UserInterest]


class User(BaseModel):
    id: int
    username: str
    nickname: str
    level: Optional[CEFRLevel] = None
    level_updated_at: Optional[datetime] = None
    initial_level_completed: bool = False
    level_score: Optional[int] = None
    interests: List[UserInterest] = Field(default_factory=list)

    class Config:
        orm_mode = True
