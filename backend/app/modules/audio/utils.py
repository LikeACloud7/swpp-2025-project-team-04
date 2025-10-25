



def parse_tts_by_newlines(tts_response: dict):
    """줄바꿈('\n') 기준으로 문장을 분리하여 문장 별 정보 리스트 반환 """
    
    alignment = tts_response.get("alignment")
    if alignment is None:
        raise ValueError("No alignment or normalized_alignment found in response")

    chars = alignment["characters"]
    starts = alignment["character_start_times_seconds"]

    sentences = []
    current_sentence = ""
    current_start_time = None
    sentence_id = 0

    for i, ch in enumerate(chars):
        if current_start_time is None:
            current_start_time = starts[i]

        # 문장에 charater 추가
        current_sentence += ch

        # 줄바꿈 감지
        if ch == "\n":
            stripped = current_sentence.strip()
            if stripped:  
                sentences.append({
                    "id": sentence_id,
                    "start_time": round(current_start_time, 3),
                    "text": stripped
                })
                sentence_id += 1
            current_sentence = ""
            current_start_time = None

    # 마지막 문장이 줄바꿈 없이 끝난 경우
    if current_sentence.strip():
        sentences.append({
            "id": sentence_id,
            "start_time": round(current_start_time or 0, 3),
            "text": current_sentence.strip()
        })

    return sentences