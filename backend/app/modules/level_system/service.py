from typing import Optional, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..users.models import User
from . import schemas
from ...core.logger import logger
from .utils import (
    _feedback_to_vector,
    _compute_levels_delta_from_weights,
    NormalizedFeedback,
    normalize_vocab_factor,
    normalize_interaction_factor,
    normalize_speed_factor,
    normalize_understanding_factor,
)
from typing import Optional, List, Dict

# 기본 설정값 (모듈 레벨)
DEFAULT_WEIGHT_MATRIX: List[List[float]] = [
    [-0.4, -1.2, 0],  # pause_cnt가 lexical_level,syntactic_level,speed_level에 주는 weight
    [-0.4, -0.8, -1.2],  # rewind_cnt가 주는 weight
    [2.4, 0, 0],  # vocab_lookup_cnt가 주는 weight
    [3.2, 0, 0],  # vocab_save_cnt가 주는 weight
    [0.32, 1.6, 0.64],  # understanding_difficulty(쉬움이 더 큰 값)가 주는 weight
    [0, 0, 1.6],  # speed_difficulty가 주는 weight
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


        # [1] 입력 normalize
        normalized_vl_cnt, normalized_vs_cnt = normalize_vocab_factor(
            db=db,
            generated_content_id=feedback_request_payload.generated_content_id, 
            vocab_lookup_cnt=feedback_request_payload.vocab_lookup_cnt,
            vocab_save_cnt=feedback_request_payload.vocab_save_cnt
        )

        normalized_pause_cnt, normalized_rewind_cnt = normalize_interaction_factor(pause_cnt=feedback_request_payload.pause_cnt, rewind_cnt=feedback_request_payload.rewind_cnt)

        normalized_understanding = normalize_understanding_factor(
            understanding_difficulty=feedback_request_payload.understanding_difficulty
        )
        normalized_speed = normalize_speed_factor(
            speed_difficulty=feedback_request_payload.speed_difficulty
        )

        # [2] 정규화된 값들을 NormalizedFeedback 객체로 생성
        normalized_feedback = NormalizedFeedback(
            pause=normalized_pause_cnt,
            rewind=normalized_rewind_cnt,
            vocab_lookup=normalized_vl_cnt,
            vocab_save=normalized_vs_cnt,
            understanding=normalized_understanding,
            speed=normalized_speed,
        )

        # 로그: 정규화된 피드백 필드들
        logger.info(
            "NormalizedFeedback - pause=%.2f, rewind=%.2f, vocab_lookup=%.2f, vocab_save=%.2f, understanding=%.2f, speed=%.2f",
            normalized_feedback.pause,
            normalized_feedback.rewind,
            normalized_feedback.vocab_lookup,
            normalized_feedback.vocab_save,
            normalized_feedback.understanding,
            normalized_feedback.speed,
        )

        # [3] NormalizedFeedback을 벡터로 변환
        vector = _feedback_to_vector(normalized_feedback)

        # 로그: 변환된 벡터
        logger.info("Feedback vector: %s", vector)

        # [4] weight matrix를 이용하여 각 level 별 변화량 계산
        W = DEFAULT_WEIGHT_MATRIX
        CLIP_RANGE = DEFAULT_CLIP_RANGES
        lexical_delta, syntactic_delta, speed_delta = _compute_levels_delta_from_weights(
            vector, W, CLIP_RANGE
        )

        # [5] DB의 유저 level에 delta를 반영 (업데이트)
        prev_lexical = float(user.lexical_level)
        prev_syntactic = float(user.syntactic_level)
        prev_speed = float(user.speed_level)

        logger.info(
            "이전 레벨 - lexical=%.2f, syntactic=%.2f, speed=%.2f",
            prev_lexical,
            prev_syntactic,
            prev_speed,
        )

        user.lexical_level = max(0.0, min(300.0, prev_lexical + lexical_delta))
        user.syntactic_level = max(0.0, min(300.0, prev_syntactic + syntactic_delta))
        user.speed_level = max(0.0, min(300.0, prev_speed + speed_delta))

        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(
            "업데이트 후 레벨 - lexical=%.2f, syntactic=%.2f, speed=%.2f",
            float(user.lexical_level),
            float(user.syntactic_level),
            float(user.speed_level),
        )

        # [6] return response
        return {
            "lexical_level_delta": lexical_delta,
            "syntactic_level_delta": syntactic_delta,
            "speed_level_delta": speed_delta,
        }

    @staticmethod
    def initialize_level(
        db: Session,
        user: User,
        initial_survey_payload ,
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
        manual_level_payload: schemas.ManualLevelRequest,
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

        from .utils import CEFRLevel, LEVEL_THRESHOLDS

        # 안전을 위해 소문자로 매칭
        level_str = manual_level_payload.level.lower()

        level_map = {
            "a1": CEFRLevel.A1,
            "a2": CEFRLevel.A2,
            "b1": CEFRLevel.B1,
            "b2": CEFRLevel.B2,
            "c1": CEFRLevel.C1,
            "c2": CEFRLevel.C2,
        }

        if level_str not in level_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid CEFR level. Must be one of A1, A2, B1, B2, C1, C2.",
            )

        cefr_level = level_map[level_str]
        score = LEVEL_THRESHOLDS[cefr_level]

        user.lexical_level = float(score)
        user.syntactic_level = float(score)
        user.speed_level = float(score)




        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "lexical_level": float(user.lexical_level),
            "syntactic_level": float(user.syntactic_level),
            "speed_level": float(user.speed_level),
        }

    @staticmethod
    def evaluate_level_test(
        db: Session,
        user: User,
        level_test_payload: schemas.LevelTestRequest,
    ) -> dict:
        """초기 레벨 테스트 결과를 기반으로 이해도 평균을 계산합니다.

        Args:
            db: DB 세션 (현재는 사용하지 않지만 시그니처 유지)
            user: 현재 사용자 (향후 로깅/저장용)
            level_test_payload: 테스트 결과 목록

        Returns:
            dict: 현재는 성공 여부만 반환 (추후 확장 가능)
        """

        from .utils import LEVEL_THRESHOLDS, CEFRLevel, MIN_SCORE, MAX_SCORE

        tests = level_test_payload.tests or []
        if not tests:
            return {"success": True}

        total = sum(item.understanding for item in tests)
        avg_understanding = total / len(tests)  # 0~100

        # 1) 이해도 평균에서 80을 빼서 -80 ~ +20 범위의 diff 계산
        diff = avg_understanding - 80.0
        diff = max(-80.0, min(20.0, diff))

        # 2) 현재 유저 레벨 스코어 (3개는 항상 동일하다고 가정)
        current_score = float(user.lexical_level)

        # 3) 현재 스코어의 기준 레벨과 인접 레벨 찾기
        thresholds = LEVEL_THRESHOLDS
        ordered_levels = [
            CEFRLevel.A1,
            CEFRLevel.A2,
            CEFRLevel.B1,
            CEFRLevel.B2,
            CEFRLevel.C1,
            CEFRLevel.C2,
        ]

        # 현재 레벨 인덱스 찾기 (current_score는 기준값과 정확히 일치한다고 가정)
        current_index = next(
            i
            for i, level in enumerate(ordered_levels)
            if float(thresholds[level]) == float(current_score)
        )

        current_level = ordered_levels[current_index]
        base_score = thresholds[current_level]

        # 4) diff >= 0: 상향 보간 (현재 레벨 ~ 다음 레벨의 중간까지)
        if diff >= 0:
            if current_level == CEFRLevel.C2:
                next_score = MAX_SCORE  # C2 이후는 300으로 간주
            else:
                next_level = ordered_levels[current_index + 1]
                next_score = thresholds[next_level]

            # 100% 이해도(diff=20)일 때 현재-다음 레벨의 정확한 중간으로 이동
            # diff 0~20 → factor 0~1
            factor = diff / 20.0
            target_score = base_score + (next_score - base_score) * 0.5 * factor
        else:
            # 5) diff < 0: 하향 보간 (이전 레벨까지)
            if current_level == CEFRLevel.A1:
                prev_score = MIN_SCORE  # A1 이전은 0으로 고정
            else:
                prev_level = ordered_levels[current_index - 1]
                prev_score = thresholds[prev_level]

            # diff -80~0 → factor 0~1
            factor = -diff / 80.0
            target_score = base_score + (prev_score - base_score) * factor

        # 6) 스코어 클램프 및 3개 레벨에 동일 적용
        target_score = max(MIN_SCORE, min(MAX_SCORE, target_score))

        user.lexical_level = float(target_score)
        user.syntactic_level = float(target_score)
        user.speed_level = float(target_score)

        db.add(user)
        db.commit()
        db.refresh(user)

        return {"success": True}
