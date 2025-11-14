from typing import Optional, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..users.models import User
from . import schemas
from .utils import _feedback_to_vector, _compute_levels_delta_from_weights
from typing import Optional, List, Dict
from .utils import normalize_vocab_factor

# 기본 설정값 (모듈 레벨)
DEFAULT_WEIGHT_MATRIX: List[List[float]] = [
    [1.0, 0, 0.2],  # pause_cnt가 lexical_level,syntactic_level,speed_level에 주는 weight
    [0.2, 0, 0.3],  # rewind_cnt가 주는 weight
    [0.1, 0, 1.0],  # vocab_lookup_cnt가 주는 weight
    [0.5, 0, 0.2],  # vocab_save_cnt가 주는 weight
    [0.3, 0, 0.4],  # understanding_difficulty가 주는 weight
    [0.2, 0, 0.2],  # speed_difficulty가 주는 weight
]

DEFAULT_CLIP_RANGES = {
    "lexical": (-8.0, 8.0),
    "syntactic": (-8.0, 8.0),
    "speed": (-8.0, 8.0),
}

class LevelSystemService:
    """레벨 시스템 서비스 - static 메서드 기반"""

    @staticmethod
    def update_level_by_feedback(
        db: Session,
        user: User,
        feedback_request_payload: schemas.SessionFeedbackRequest,
        weight_matrix: Optional[List[List[float]]] = None,
        clip_ranges: Optional[dict] = None,
    ) -> dict:
        """
        사용자의 세션 피드백을 기반으로 레벨을 업데이트합니다.

        Args:
            db: DB 세션
            user: 현재 사용자
            feedback_request_payload (SessionFeedbackRequest): 세션 피드백 데이터
            weight_matrix: 가중치 행렬 (옵션, 기본값 사용 가능)
            clip_ranges: 클리핑 범위 (옵션, 기본값 사용 가능)

        Returns:
            dict: 업데이트된 레벨의 변화량을 포함하는 딕셔너리
            {
                "lexical_level_delta": float,
                "syntactic_level_delta": float,
                "speed_level_delta": float
            }
        """



        normalized_vl_cnt, normalized_vs_cnt = normalize_vocab_factor(db,
                                                                      feedback_request_payload.generated_content_id, 
                                                                      feedback_request_payload.vocab_lookup_cnt,
                                                                      feedback_request_payload.vocab_save_cnt)

        # [1] feedback_request_payload에서 6차원 입력 벡터 추출





        # [2]
        vector = _feedback_to_vector(feedback_request_payload)





        # [2] weight matrix를 이용하여 각 level 별 변화량 계산
        W = weight_matrix or DEFAULT_WEIGHT_MATRIX
        CLIP_RANGE = clip_ranges or DEFAULT_CLIP_RANGES
        lexical_delta, syntactic_delta, speed_delta = _compute_levels_delta_from_weights(
            vector, W, CLIP_RANGE
        )

        # [3] DB의 유저 level에 delta를 반영 (업데이트)
        user.lexical_level = float(user.lexical_level) + lexical_delta
        user.syntactic_level = float(user.syntactic_level) + syntactic_delta
        user.speed_level = float(user.speed_level) + speed_delta

        db.add(user)
        db.commit()
        db.refresh(user)

        # [4] return response
        return {
            "lexical_level_delta": lexical_delta,
            "syntactic_level_delta": syntactic_delta,
            "speed_level_delta": speed_delta,
        }

    @staticmethod
    def initialize_level(
        db: Session,
        user: User,
        initial_survey_payload: schemas.InitialSurveyRequest,
    ) -> dict:
        """
        초기 설문조사 결과(5개의 콘텐츠에 대한 understanding 데이터)를 기반으로 사용자의 레벨을 초기화합니다.

        Args:
            db: DB 세션
            user: 현재 사용자
            initial_survey_payload (InitialSurveyRequest): 초기 설문조사 데이터

        Returns:
            dict: 초기화된 레벨 정보
            {
                "lexical_level": float,
                "syntactic_level": float,
                "speed_level": float
            }
        """
        # TODO: 초기 설문조사 결과를 분석하여 레벨 계산
        # - initial_survey_payload.tests의 각 테스트 결과를 분석
        # - understanding 점수를 기반으로 초기 레벨 산정
        # - user.lexical_level, user.syntactic_level, user.speed_level 설정
        # - DB에 반영
        user.lexical_level = 100
        user.syntactic_level = 100
        user.speed_level = 100

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "lexical_level": float(user.lexical_level),
            "syntactic_level": float(user.syntactic_level),
            "speed_level": float(user.speed_level),
        }

    @staticmethod
    def set_manual_level(
        db: Session,
        user: User,
        manual_level_payload: schemas.InitialSurveySkipRequest,
    ) -> dict:
        """
        사용자의 레벨을 수동으로 설정합니다 (초기 설문조사 건너뛰기).

        Args:
            db: DB 세션
            user: 현재 사용자
            manual_level_payload (InitialSurveySkipRequest): 수동 레벨 설정 데이터

        Returns:
            dict: 설정된 레벨 정보
            {
                "lexical_level": float,
                "syntactic_level": float,
                "speed_level": float
            }
        """
        # 사용자가 지정한 단일 레벨로 3개 레벨을 모두 동일하게 설정하기.
        user.lexical_level = manual_level_payload.level
        user.syntactic_level = manual_level_payload.level
        user.speed_level = manual_level_payload.level

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "lexical_level": float(user.lexical_level),
            "syntactic_level": float(user.syntactic_level),
            "speed_level": float(user.speed_level),
        }
