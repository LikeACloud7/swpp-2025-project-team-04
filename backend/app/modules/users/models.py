from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, func, Boolean
from enum import Enum
from ...core.config import Base
from ..personalization.models import CEFRLevel


class CEFRLevel(Enum):
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    nickname = Column(String(50), nullable=False)
    level = Column(SAEnum(CEFRLevel, name="cefr_level"), nullable=False, default=CEFRLevel.A1)
    level_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    initial_level_completed = Column(Boolean, nullable=False, default=False)
    level_score = Column(Integer, nullable=True)
    llm_confidence = Column(Integer, nullable=True)
