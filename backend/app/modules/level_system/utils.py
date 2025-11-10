from . import schemas

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
