from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from ..personalization.models import CEFRLevel


class User(BaseModel):
    id: int
    username: str
    nickname: str
    level: Optional[CEFRLevel] = None
    level_updated_at: Optional[datetime] = None
    initial_level_completed: bool = False
    level_score: Optional[int] = None

    class Config:
        orm_mode = True
