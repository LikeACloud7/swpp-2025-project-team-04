from . import schemas
from enum import Enum


class CEFRLevel(Enum):
    """CEFR 레벨 정의"""
    A1 = "A1"
    A2 = "A2"
    B1 = "B1"
    B2 = "B2"
    C1 = "C1"
    C2 = "C2"


# TODO: 실제로 저장할 레벨 별 구간값들 정하기
LEVEL_THRESHOLDS = {
    CEFRLevel.A1: 0,
    CEFRLevel.A2: 25,
    CEFRLevel.B1: 50,
    CEFRLevel.B2: 75,
    CEFRLevel.C1: 100,
    CEFRLevel.C2: 125,
}
MAX_SCORE = 150  # 최대 스코어



def get_cefr_level_from_score(score: float) -> CEFRLevel:
    """
    스코어(0~150)로부터 CEFR 레벨(A1~C2)을 반환합니다.
    
    Args:
        score: 0~150 범위의 레벨 스코어
        
    Returns:
        CEFRLevel Enum 객체
    """
    # 스코어를 0~150 범위로 클램프
    score = max(0, min(MAX_SCORE, score))
    
    # 레벨 결정 (내림차순으로 체크)
    if score >= LEVEL_THRESHOLDS[CEFRLevel.C2]:
        return CEFRLevel.C2
    elif score >= LEVEL_THRESHOLDS[CEFRLevel.C1]:
        return CEFRLevel.C1
    elif score >= LEVEL_THRESHOLDS[CEFRLevel.B2]:
        return CEFRLevel.B2
    elif score >= LEVEL_THRESHOLDS[CEFRLevel.B1]:
        return CEFRLevel.B1
    elif score >= LEVEL_THRESHOLDS[CEFRLevel.A2]:
        return CEFRLevel.A2
    else:
        return CEFRLevel.A1


def get_average_score_and_level(
    lexical_score: float,
    syntactic_score: float,
    speed_score: float
) -> dict[str, float | CEFRLevel]:
    """
    3개의 레벨 스코어를 받아 평균 스코어와 평균 CEFR 레벨을 반환합니다.
    
    Args:
        lexical_score: 어휘 레벨 스코어 (0~150)
        syntactic_score: 구문 레벨 스코어 (0~150)
        speed_score: 속도 레벨 스코어 (0~150)
        
    Returns:
        {
            "average_score": 평균 스코어 (float),
            "average_level": CEFRLevel Enum 객체
        }
    """
    # 평균 계산
    average_score = round((lexical_score + syntactic_score + speed_score) / 3, 1)
    
    # 평균 스코어로부터 레벨 결정
    average_level = get_cefr_level_from_score(average_score)
    
    return {
        "average_score": average_score,
        "average_level": average_level
    }




def _feedback_to_vector(feedback: schemas.SessionFeedbackRequest) -> list[int]:
    """SessionFeedbackRequest에서 generated_content_id를 제외한 6개의 정수 요소를
    순서대로 추출하여 벡터로 반환합니다.

    순서: pause_cnt, rewind_cnt, vocab_lookup_cnt, vocab_save_cnt, understanding_difficulty, speed_difficulty
    None은 0으로 취급합니다.
    """
    return [
        int(feedback.pause_cnt or 0),
        int(feedback.rewind_cnt or 0),
        int(feedback.vocab_lookup_cnt or 0),
        int(feedback.vocab_save_cnt or 0),
        int(feedback.understanding_difficulty or 0),
        int(feedback.speed_difficulty or 0),
    ]


def _compute_levels_delta_from_weights(
    vector: list[int],
    W: list[list[float]],
    clip_ranges: dict[str, tuple[float, float]] | None = None,
) -> tuple[float, float, float]:
    """
    6차원 피드백 벡터와 6x3 weight matrix W를 받아 3차원 결과를 계산합니다. 이는 각 레벨 별 변화량입니다.
    각 결과(lexical, syntactic, speed)에 대해 clip_ranges로 개별 클리핑 가능.

    clip_ranges 예시:
        {
            "lexical": (-2.0, 2.0),
            "syntactic": (-1.5, 1.5),
            "speed": (-1.0, 1.0)
        }
    """

    if len(vector) != 6:
        raise ValueError("feedback vector must be length 6")
    if len(W) != 6 or any(len(row) != 3 for row in W):
        raise ValueError("weight matrix W must be 6x3")

    # 결과 초기화
    res = [0.0, 0.0, 0.0]

    # 가중합 계산
    for i in range(6):
        for j in range(3):
            res[j] += vector[i] * W[i][j]

    # 반올림
    res = [round(v, 2) for v in res]

    # 개별 클리핑
    if clip_ranges:
        lexical_min, lexical_max = clip_ranges.get("lexical", (-float("inf"), float("inf")))
        syntactic_min, syntactic_max = clip_ranges.get("syntactic", (-float("inf"), float("inf")))
        speed_min, speed_max = clip_ranges.get("speed", (-float("inf"), float("inf")))

        res[0] = max(lexical_min, min(lexical_max, res[0]))
        res[1] = max(syntactic_min, min(syntactic_max, res[1]))
        res[2] = max(speed_min, min(speed_max, res[2]))

    return res[0], res[1], res[2]

