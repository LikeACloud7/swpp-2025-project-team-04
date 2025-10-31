import json
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Dict

import pytest

from backend.app.core.llm import LLMServiceError
from backend.app.modules.personalization import crud, schemas
from backend.app.modules.personalization.models import CEFRLevel, LevelTestScript
from backend.app.modules.personalization.service import PersonalizationService
from backend.app.modules.users import crud as user_crud


class FakePrompt:
    system = "system prompt"
    user = "tests: {tests}\ncefr: {cefr_bands}\nprofile: {current_profile}"


@pytest.fixture(autouse=True)
def patch_prompt_store(monkeypatch):
    from backend.app.modules.personalization import service as service_module
    monkeypatch.setattr(service_module._PROMPT_STORE, "load", lambda _: FakePrompt)


class FakeLLMClient:
    def __init__(self, *, response: str | None = None, error: Exception | None = None):
        self._response = response
        self._error = error
        self.calls = []

    def generate_json(self, **kwargs) -> str:
        self.calls.append(kwargs)
        if self._error is not None:
            raise self._error
        return self._response


def make_scripts() -> Dict[str, LevelTestScript]:
    return {
        "script-a": LevelTestScript(
            id="script-a",
            transcript="Welcome to the placement test.",
            target_level=CEFRLevel.B1,
        ),
        "script-b": LevelTestScript(
            id="script-b",
            transcript="Advanced discussion about economics.",
            target_level=CEFRLevel.C1,
        ),
    }


def test_summarize_level_test_with_llm_success():
    llm = FakeLLMClient(
        response=json.dumps(
            {
                "level": "B2",
                "level_score": 68,
                "llm_confidence": 72,
                "rationale": "Learner shows solid upper-intermediate comprehension.",
            }
        )
    )
    service = PersonalizationService(llm_client=llm)

    tests = [
        schemas.LevelTestItem(script_id="script-a", understanding=55),
        schemas.LevelTestItem(script_id="script-b", understanding=60),
    ]
    result = service._summarize_level_test(
        tests=tests,
        scripts=make_scripts(),
    )

    assert result.level == CEFRLevel.B2
    assert result.level_score == 68
    assert result.llm_confidence == 72
    assert "upper-intermediate" in result.rationale
    assert len(llm.calls) == 1


def test_summarize_level_test_invalid_llm_payload_uses_defaults():
    llm = FakeLLMClient(
        response=json.dumps(
            {
                "level": "Z9",           # 잘못된 레벨 → fallback
                "level_score": "oops",   # 숫자 아님 → 기본값
                "llm_confidence": -50,   # 범위 밖 → clamp
                "rationale": "",
            }
        )
    )
    service = PersonalizationService(llm_client=llm)

    tests = [
        schemas.LevelTestItem(script_id="script-a", understanding=30),
        schemas.LevelTestItem(script_id="script-b", understanding=32),
    ]
    result = service._summarize_level_test(
        tests=tests,
        scripts=make_scripts(),
    )

    assert result.level == CEFRLevel.A2
    assert result.level_score == 28  # A2 구간 중간값
    assert result.llm_confidence == 0  # clamp 결과
    assert result.rationale == "평가 근거가 제공되지 않았습니다."


class DummySession:
    def __init__(self):
        self.commits = 0
        self.refreshed = []

    def commit(self):
        self.commits += 1

    def refresh(self, obj):
        self.refreshed.append(obj)


def test_set_manual_level_updates_user_and_history(monkeypatch):
    db = DummySession()
    user = SimpleNamespace(id=42)
    updated_at = datetime.now(timezone.utc)

    def fake_update_user_level(
        db_arg,
        *,
        user_id,
        level,
        level_score=None,
        llm_confidence=None,
        initial_level_completed=None,
        commit,
    ):
        assert db_arg is db
        assert user_id == user.id
        assert level == CEFRLevel.B2
        assert level_score is None
        assert llm_confidence is None
        assert initial_level_completed is True
        assert commit is False
        return SimpleNamespace(
            id=user_id,
            level=level,
            level_updated_at=updated_at,
        )

    def fake_insert_level_history(
        db_arg,
        *,
        user_id,
        level,
        level_score=None,
        llm_confidence=None,
        average_understanding=None,
        sample_count=None,
    ):
        assert db_arg is db
        assert user_id == user.id
        assert level == CEFRLevel.B2
        assert level_score is None
        assert llm_confidence is None
        assert average_understanding is None
        assert sample_count is None
        return SimpleNamespace(user_id=user_id, level=level)

    monkeypatch.setattr(user_crud, "update_user_level", fake_update_user_level)
    monkeypatch.setattr(crud, "insert_level_history", fake_insert_level_history)

    service = PersonalizationService()
    payload = schemas.ManualLevelUpdateRequest(level=CEFRLevel.B2)

    response = service.set_manual_level(db=db, user=user, payload=payload)

    assert db.commits == 1
    assert len(db.refreshed) == 2
    assert response.level == CEFRLevel.B2
    assert response.level_description == schemas.CEFR_LEVEL_DESCRIPTIONS[CEFRLevel.B2]
    assert response.updated_at == updated_at


def test_evaluate_session_feedback_updates_user_and_history(monkeypatch):
    db = DummySession()
    updated_at = datetime.now(timezone.utc)
    user = SimpleNamespace(
        id=7,
        level=CEFRLevel.B1,
        level_score=52,
        llm_confidence=48,
        initial_level_completed=True,
        level_updated_at=updated_at,
    )

    llm = FakeLLMClient(
        response=json.dumps(
            {
                "level": "B2",
                "level_score": 70,
                "llm_confidence": 65,
                "rationale": "Learner shows improved comprehension after session.",
            }
        )
    )
    service = PersonalizationService(llm_client=llm)

    def fake_get_scripts_by_ids(db_arg, ids):
        scripts = make_scripts()
        return {script_id: scripts[script_id] for script_id in ids}

    def fake_update_user_level(
        db_arg,
        *,
        user_id,
        level,
        level_score=None,
        llm_confidence=None,
        initial_level_completed=None,
        commit,
    ):
        assert db_arg is db
        assert user_id == user.id
        assert level == CEFRLevel.B2
        assert level_score == 70
        assert llm_confidence == 65
        assert initial_level_completed is True
        assert commit is False
        return SimpleNamespace(
            id=user_id,
            level=level,
            level_updated_at=updated_at,
        )

    def fake_insert_level_history(
        db_arg,
        *,
        user_id,
        level,
        level_score=None,
        llm_confidence=None,
        average_understanding=None,
        sample_count=None,
    ):
        assert db_arg is db
        assert user_id == user.id
        assert level == CEFRLevel.B2
        assert level_score == 70
        assert llm_confidence == 65
        assert average_understanding == 55
        assert sample_count == 2
        return SimpleNamespace(user_id=user_id, level=level)

    monkeypatch.setattr(crud, "get_scripts_by_ids", fake_get_scripts_by_ids)
    monkeypatch.setattr(user_crud, "update_user_level", fake_update_user_level)
    monkeypatch.setattr(crud, "insert_level_history", fake_insert_level_history)

    payload = schemas.LevelTestRequest(
        tests=[
            schemas.LevelTestItem(script_id="script-a", understanding=50),
            schemas.LevelTestItem(script_id="script-b", understanding=60),
        ]
    )

    response = service.evaluate_session_feedback(db=db, user=user, payload=payload)

    assert db.commits == 1
    assert len(db.refreshed) == 2
    assert response.level == CEFRLevel.B2
    assert response.scores.level_score == 70
    assert '"context": "session_feedback"' in llm.calls[0]["user_prompt"]
