from backend.app.modules.audio.utils import parse_tts_by_newlines


FAKE_TTS_RESPONSE = {
    "audio_base64": "FAKE_AUDIO_DATA",
    "alignment": {
        "characters": [
            "G","o","o","d"," ","m","o","r","n","i","n","g","!","\n",
            "H","o","w"," ","a","r","e"," ","y","o","u"," ","t","o","d","a","y","?","\n",
            "I"," ","h","o","p","e"," ","y","o","u"," ","s","l","e","p","t"," ","w","e","l","l","."
        ],
        "character_start_times_seconds": [
            0.0,0.05,0.09,0.12,0.16,0.20,0.25,0.29,0.33,0.36,0.40,0.45,0.49,0.55,
            0.60,0.65,0.70,0.73,0.77,0.81,0.85,0.89,0.93,0.97,1.01,1.05,1.09,1.13,1.17,1.21,1.25,1.30,1.35,
            1.40,1.45,1.49,1.54,1.58,1.62,1.66,1.70,1.74,1.78,1.82,1.86,1.90,1.95,2.00,2.04,2.08,2.12,2.16,2.20,2.24,2.28
        ],
        "character_end_times_seconds": [
            0.05,0.09,0.12,0.16,0.20,0.25,0.29,0.33,0.36,0.40,0.45,0.49,0.55,0.60,
            0.65,0.70,0.73,0.77,0.81,0.85,0.89,0.93,0.97,1.01,1.05,1.09,1.13,1.17,1.21,1.25,1.30,1.35,1.40,
            1.45,1.49,1.54,1.58,1.62,1.66,1.70,1.74,1.78,1.82,1.86,1.90,1.95,2.00,2.04,2.08,2.12,2.16,2.20,2.24,2.28,2.32
        ]
    }
}

def test_parse_tts_by_newlines_basic():
    """Verify that the parser correctly splits text by newline characters and extracts start times and words."""
    sentences_response = parse_tts_by_newlines(FAKE_TTS_RESPONSE)
    print(sentences_response)
    # Result should be a list of sentences
    assert isinstance(sentences_response, list)
    assert len(sentences_response) == 3  # Expect three sentences

    # Validate structure and field types
    for sentence in sentences_response:
        assert set(sentence.keys()) == {"id", "start_time", "text", "words"}
        assert isinstance(sentence["words"], list)
        for w in sentence["words"]:
            assert isinstance(w, str)

        assert isinstance(sentence["id"], int)
        assert isinstance(sentence["start_time"], float)
        assert isinstance(sentence["text"], str)
        assert len(sentence["text"]) > 0

    assert sentences_response[0]["text"].startswith("Good morning")
    assert sentences_response[1]["text"].startswith("How are you")
    assert sentences_response[2]["text"].startswith("I hope you")

    # --- 🔹 Expected word lists for each sentence ---
    expected_words = [
        ["good", "morning"],
        ["how", "are", "you", "today"],
        ["i", "hope", "you", "slept", "well"],
    ]

    # Verify exact match for each sentence's words
    for i, expected in enumerate(expected_words):
        assert sentences_response[i]["words"] == expected, f"Sentence {i} words mismatch: {sentences_response[i]['words']} != {expected}"

    # Verify all unique words combined
    all_expected_words = [w for group in expected_words for w in group]
    all_extracted_words = [w for s in sentences_response for w in s["words"]]
    assert all_extracted_words == all_expected_words, f"Global word list mismatch: {all_extracted_words}"



def test_parse_tts_by_newlines_trailing_newline():
    """Ensure that irregular newline pattern is still parsed correctly."""
    fake_resp = {
        "alignment": {
            "characters": ["\n", "H", "i", "!", "\n","\n", "B", "y", "e", "!","\n"],
            "character_start_times_seconds": [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
            "character_end_times_seconds": [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4],
        }
    }

    sentences = parse_tts_by_newlines(fake_resp)
    assert len(sentences) == 2
    assert sentences[0]["text"] == "Hi!"
    assert sentences[1]["text"] == "Bye!"


# TODO : audio/service에 정의된 _split_script_by_newlines 유닛 테스트 코드 작성하기.