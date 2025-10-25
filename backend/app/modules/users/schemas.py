from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class CEFRLevel(str, Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


class User(BaseModel):
    id: int
    username: str
    nickname: str
    level: Optional[CEFRLevel] = CEFRLevel.A1
    level_updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True