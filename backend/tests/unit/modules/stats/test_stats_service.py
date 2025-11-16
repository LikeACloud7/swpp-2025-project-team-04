from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace

from app.modules.stats import service as stats_service


def _make_user(level: float = 90.0):
    return SimpleNamespace(
        id=1,
        lexical_level=Decimal(level),
        syntactic_level=Decimal(level),
        speed_level=Decimal(level),
        level_updated_at=None,
    )


def test_stats_service_builds_full_payload(monkeypatch):
    svc = stats_service.StatsService()
    user = _make_user()

    today = date.today()
    activity_dates = [today - timedelta(days=offset) for offset in range(5)]

    monkeypatch.setattr(stats_service.crud, "ensure_achievements", lambda *_, **__: None)
    monkeypatch.setattr(
        stats_service.crud,
        "list_achievements",
        lambda *_: [
            SimpleNamespace(code="FIRST_SESSION", name="First", description="desc", category="milestone"),
            SimpleNamespace(code="TOTAL_3000", name="Hardworker", description="desc", category="time"),
        ],
    )
    monkeypatch.setattr(
        stats_service.crud,
        "get_daily_study_minutes",
        lambda *_, **__: {today - timedelta(days=1): 60, today: 45},
    )
    monkeypatch.setattr(
        stats_service.crud,
        "get_study_dates_descending",
        lambda *_, **__: activity_dates,
    )
    monkeypatch.setattr(stats_service.crud, "get_total_study_minutes", lambda *_, **__: 3_600)

    recorded_unlocks = []

    def fake_ensure_user_achievement(db, user_id, achievement_code):
        recorded_unlocks.append((user_id, achievement_code))
        return SimpleNamespace(achievement_code=achievement_code, achieved_at=today)

    monkeypatch.setattr(stats_service.crud, "ensure_user_achievement", fake_ensure_user_achievement)
    monkeypatch.setattr(
        stats_service.crud,
        "list_user_achievements",
        lambda *_, **__: [SimpleNamespace(achievement_code="FIRST_SESSION", achieved_at=today)],
    )

    payload = svc.get_user_stats(db="session", user=user)

    assert payload.total_time_spent_minutes == 3_600
    assert payload.current_level.lexical.cefr_level.value == stats_service.get_cefr_level_from_score(90.0).value
    assert payload.streak.consecutive_days == 5
    assert recorded_unlocks  # achievements recorded
    assert any(a.code == "FIRST_SESSION" for a in payload.achievements)


def test_stats_service_helpers():
    svc = stats_service.StatsService()
    today = date.today()
    assert svc._calculate_streak([today, today - timedelta(days=1), today - timedelta(days=3)]) == 2
    assert svc._calculate_streak([]) == 0

    level = svc._build_skill_level(Decimal("15.5"))
    assert level.cefr_level.value in {"A1", "A2", "B1", "B2", "C1", "C2"}

    assert svc._coerce_skill_score("not-number") == stats_service.MIN_SCORE
