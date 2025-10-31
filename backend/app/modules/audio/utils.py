import re
from elevenlabs import ElevenLabs
from ...core.config import settings

def get_elevenlabs_client(): # for circular dependency resolution
    return ElevenLabs(api_key=settings.elevenlabs_api_key)

def extract_words_from_sentence(sentence: str) -> list[str]:
    """
    Extract clean English words from a sentence.
    Handles contractions, punctuation, and case normalization.
    Returns a list of lowercase words only.
    """
    if not isinstance(sentence, str):
        return []

    # Normalize whitespace
    sentence = sentence.strip()

    # Keep only letters and apostrophes inside words
    # e.g., "don't", "I'm" should be kept as one word
    tokens = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", sentence)

    # Normalize to lowercase
    words = [t.lower() for t in tokens]

    return words


def parse_tts_by_newlines(tts_response: dict):
    """Return a list of sentence information by splitting the text based on newline ('\n') characters."""
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
        current_sentence += ch

        if ch == "\n":
            stripped = current_sentence.strip()
            if stripped:
                sentences.append({
                    "id": sentence_id,
                    "start_time": round(current_start_time, 3),
                    "text": stripped,
                    "words": extract_words_from_sentence(stripped)
                })
                sentence_id += 1
            current_sentence = ""
            current_start_time = None

    if current_sentence.strip():
        stripped = current_sentence.strip()
        sentences.append({
            "id": sentence_id,
            "start_time": round(current_start_time or 0, 3),
            "text": stripped,
            "words": extract_words_from_sentence(stripped)
        })

    return sentences




