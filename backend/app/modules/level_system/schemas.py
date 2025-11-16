from typing import Optional, List

from pydantic import BaseModel


# feedback request
class SessionFeedbackRequest(BaseModel):
    generated_content_id: Optional[int] = None  # 피드백을 하는 content_id. 레벨 update 시에 사용 안 될 것 같다.
    pause_cnt: Optional[int] = None  # 재생 중지 카운트
    rewind_cnt: Optional[int] = None  # 되감기 카운트
    vocab_lookup_cnt: Optional[int] = None  # 단어 검색 카운트
    vocab_save_cnt: Optional[int] = None  # 단어를 저장한 카운트
    understanding_difficulty: Optional[int] = None  # 이해도 값(0,1,2,3,4. 4가 가장 이해가 높다)
    speed_difficulty: Optional[int] = None  # 오디오 빠르기 (0,1,2,3,4. 4가 가장 느리다)


# level-test request
class LevelTestItem(BaseModel):
    script_id: str
    generated_content_id: int
    understanding: int


class LevelTestRequest(BaseModel):
    tests: List[LevelTestItem]


class LevelTestResponse(BaseModel):
    success: bool = True


# manual level request/response
class ManualLevelRequest(BaseModel):
    level: str


class ManualLevelResponse(BaseModel):
    success: bool = True

