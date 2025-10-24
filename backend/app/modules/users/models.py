from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, func
from enum import Enum
from ...core.config import Base

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
    nickname = Column(String(50), unique=False, index=False, nullable=False)
    level = Column(SAEnum(CEFRLevel, name="cefr_level"), nullable=False, default=CEFRLevel.A1)
    level_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())