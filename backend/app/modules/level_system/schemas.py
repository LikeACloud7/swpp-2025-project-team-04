from typing import Optional, List
from pydantic import BaseModel


class SessionFeedbackRequest(BaseModel):
    generated_content_id: Optional[int] = None # 피드백을 하는 content_id. 레벨 update 시에 사용 안 될 것 같다.
    pause_cnt: Optional[int] = None # 재생 중지 카운트
    rewind_cnt: Optional[int] = None # 되감기 카운트
    vocab_lookup_cnt: Optional[int] = None # 단어 검색 카운트
    vocab_save_cnt: Optional[int] = None # 단어를 저장한 카운트
    understanding_difficulty: Optional[int] = None # 이해도 값(0~100. 선택 방식인 경우 정수값으로 정규화하여 전달)
    speed_difficulty: Optional[int] = None # 오디오 빠르기


class InitialSurveyTestItem(BaseModel):
    """초기 설문조사의 각 테스트 항목"""
    script_id: str
    understanding: int  # 0~100 이해도 점수


class InitialSurveyRequest(BaseModel):
    """초기 설문조사 요청 - 1~5개의 테스트 결과를 포함"""
    tests: List[InitialSurveyTestItem]


class InitialSurveySkipRequest(BaseModel):
    """초기 설문조사 건너뛰기 - 수동으로 단일 레벨 설정"""
    level: float  # 0~150 범위의 레벨 스코어
