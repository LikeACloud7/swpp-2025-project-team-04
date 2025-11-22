from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, func, Boolean, DECIMAL
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
    nickname = Column(String(50), nullable=False)
    level = Column(SAEnum(CEFRLevel, name="cefr_level"), nullable=False, default=CEFRLevel.A1) # deprecated
    level_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now()) # deprecated
    initial_level_completed = Column(Boolean, nullable=False, default=False)    
    level_score = Column(Integer, nullable=True) # deprecated
    llm_confidence = Column(Integer, nullable=True) 
    


    # Advanced level system fields (소숫점 첫째자리까지 관리)
    lexical_level = Column(DECIMAL(4, 1), nullable=False, default=0.0) # 어휘
    syntactic_level = Column(DECIMAL(4, 1), nullable=False, default=0.0) #문법 
    speed_level = Column(DECIMAL(4, 1), nullable=False, default=0.0) # 발화 속도
