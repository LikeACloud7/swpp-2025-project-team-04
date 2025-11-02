from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from ..level_management.models import CEFRLevel


class DailyStudyMinutes(BaseModel):
    date: date
    minutes: int = Field(ge=0)


class StudyStreakSummary(BaseModel):
    consecutive_days: int = Field(ge=0)
    weekly_total_minutes: int = Field(ge=0)
    daily_minutes: List[DailyStudyMinutes]


class LevelProgress(BaseModel):
    level: Optional[CEFRLevel] = None
    level_score: Optional[int] = Field(default=None, ge=0, le=100)
    llm_confidence: Optional[int] = Field(default=None, ge=0, le=100)
    updated_at: Optional[datetime] = None


class AchievementStatus(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    achieved: bool
    achieved_at: Optional[datetime] = None


class UserStatsResponse(BaseModel):
    streak: StudyStreakSummary
    current_level: LevelProgress
    total_time_spent_minutes: int = Field(ge=0)
    achievements: List[AchievementStatus]
