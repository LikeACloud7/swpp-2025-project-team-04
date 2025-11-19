from __future__ import annotations

import asyncio
import base64
from types import SimpleNamespace

import pytest

from app.modules.audio import service as audio_service_module
from app.modules.audio.schemas import AudioGenerateRequest
from app.modules.audio.service import AudioService


@pytest.fixture()
def fake_user():
    return SimpleNamespace(
        id=1,
        username="tester",
        lexical_level=50.0,
        syntactic_level=45.0,
        speed_level=55.0,
    )


class DummySession:
    def close(self):
        pass


class DummyWebSocket:
    def __init__(self):
        self.messages = []

    async def send_json(self, payload):
        self.messages.append(payload)


async def _fake_generate_script(*_, **__):
    return "Test Title", "Line one.\nLine two."


async def _fake_generate_audio(*_, **__):
    return {
        "audio_base_64": base64.b64encode(b"audio-bytes").decode(),
        "sentences": [{"start_time": 0, "end_time": 120, "text": "Line one."}],
    }


def _patch_audio_pipeline(monkeypatch, sqlite_session):
    fake_voice = {"voice_id": "voice-1", "tags": {"gender": "F", "accent": "none", "style": "calm"}}
    monkeypatch.setattr(AudioService, "_load_voices", staticmethod(lambda: [fake_voice]))
    monkeypatch.setattr(AudioService, "_select_voice_algorithmically", staticmethod(lambda *args, **kwargs: fake_voice))
    monkeypatch.setattr(AudioService, "_generate_script", staticmethod(_fake_generate_script))
    monkeypatch.setattr(AudioService, "_generate_audio_with_timestamps", staticmethod(_fake_generate_audio))
    monkeypatch.setattr(audio_service_module, "generate_s3_object_key", lambda ext="mp3": f"audio/generated.{ext}")
    monkeypatch.setattr(audio_service_module, "upload_audio_to_s3", lambda audio_bytes, key: f"https://cdn/{key}")
    monkeypatch.setattr(audio_service_module, "insert_study_session_from_sentences", lambda user_id, sentences, activity_type="audio": sentences)
    monkeypatch.setattr(audio_service_module, "SessionLocal", lambda: DummySession())

    async def fake_vocab(sentences, content_id):
        return {"sentences": sentences, "content_id": content_id}

    monkeypatch.setattr(audio_service_module.VocabService, "build_contextual_vocab", staticmethod(fake_vocab))

    records = {}

    def fake_insert(db, **kwargs):
        record = SimpleNamespace(generated_content_id=777, **kwargs)
        records["record"] = record
        return record

    def fake_update(db, content_id, audio_url, response_json):
        records["updated"] = {"id": content_id, "audio_url": audio_url, "response": response_json}
        return SimpleNamespace(generated_content_id=content_id, audio_url=audio_url, response_json=response_json)

    monkeypatch.setattr(audio_service_module.crud, "insert_generated_content", fake_insert)
    monkeypatch.setattr(audio_service_module.crud, "update_generated_content_audio", fake_update)
    return records


def test_generate_full_audio_with_timestamps(monkeypatch, sqlite_session, fake_user):
    records = _patch_audio_pipeline(monkeypatch, sqlite_session)
    request = AudioGenerateRequest(mood="calm", theme="ocean")

    response = asyncio.run(AudioService.generate_full_audio_with_timestamps(request, fake_user))

    assert response["generated_content_id"] == 777
    assert response["audio_url"].startswith("https://cdn/")
    assert records["updated"]["audio_url"] == response["audio_url"]


def test_generate_full_audio_streaming(monkeypatch, sqlite_session, fake_user):
    records = _patch_audio_pipeline(monkeypatch, sqlite_session)
    request = AudioGenerateRequest(mood="energetic", theme="space")
    ws = DummyWebSocket()

    asyncio.run(AudioService.generate_full_audio_streaming(request, fake_user, ws))

    assert any(msg["type"] == "generation_complete" for msg in ws.messages)
    assert records["updated"]["id"] == 777
