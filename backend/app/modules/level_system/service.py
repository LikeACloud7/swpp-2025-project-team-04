from typing import Optional, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..users.models import User
from . import schemas
from .utils import _feedback_to_vector, _compute_levels_delta_from_weights
from typing import Optional, List, Dict

class LevelSystemService:

    def __init__(self, db: Optional[Session] = None):
        self.db = db


        # TODO : 각 Input과 Output(level 변화량) 별로 어떻게 파라미터를 설정할지 고민
        self.weight_matrix: List[List[float]] = [
                [1.0, 0, 0.2], # pause_cnt가 lexical_level,syntactic_level,speed_level에 주는 weight
                [0.2, 0, 0.3], # rewind_cnt가 주는 weight
                [0.1, 0, 1.0], # vocab_lookup_cnt가 주는 weight
                [0.5, 0, 0.2], # vocab_save_cnt가 주는 weight
                [0.3, 0, 0.4], # understanding_difficulty가 주는 weight
                [0.2, 0, 0.2], # speed_difficulty가 주는 weight
            ]
        

        # 일종의 정규화. 각 LEVEL 별로 한번의 피드백으로 인해서 바뀔수 있는 최대 Range를 정의.
        # TODO: Outlier를 대비하여 range를 얼마나 제한할지 고민
        self.clip_ranges = {
            "lexical": (-2.0, 2.0),
            "syntactic": (-2.0, 2.0),
            "speed": (-2.0, 2.0),
        }

    def update_level(
        self,
        user: User,
        feedback_request_payload: schemas.SessionFeedbackRequest,
    ) -> dict:
        """
        사용자의 세션 피드백을 기반으로 레벨을 업데이트합니다.

        Args:
            db: DB 세션
            user: 현재 사용자
            feedback_request_payload (SessionFeedbackRequest): 세션 피드백 데이터

        Returns:
            dict: 업데이트된 레벨의 변화량을 포함하는 딕셔너리
            {
                "lexical_level_delta": float,
                "syntactic_level_delta": float,
                "speed_level_delta": float
            }
        """
        # feedback_request_payload에서 6차원 입력 벡터를 추출합니다.
        vector = _feedback_to_vector(feedback_request_payload)

        W = self.weight_matrix
        CLIP_RANGE = self.clip_ranges

        lexical, syntactic, speed = _compute_levels_delta_from_weights(
            vector, W, CLIP_RANGE
        ) # 이 값들을 기존 level에 더한다.

        

        # TODO : 실제로 DB의 유저 level을 각각 변경

        # 변화량을 return
        return {
            "lexical_level_delta": lexical,
            "syntactic_level_delta": syntactic,
            "speed_level_delta": speed,
        }
