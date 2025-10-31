from datetime import datetime, timezone
from types import SimpleNamespace

from backend.app.modules.stats import crud
from backend.app.modules.stats.service import StatsService
from backend.app.modules.level_management.models import CEFRLevel
from backend.app.modules.stats.models import StudySession
from backend.app.modules.users.models import User as AppUser, CEFRLevel as UserCEFRLevel
from backend.app.core.config import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def test_get_user_stats_aggregates_data(monkeypatch):
    from backend.app.modules.stats import service as service_module

    real_datetime = datetime

    class FixedDateTime(real_datetime):
        @classmethod
        def now(cls, tz=None):
            base = real_datetime(2024, 5, 7, 9, 0, tzinfo=timezone.utc)
            if tz is None:
                return base.replace(tzinfo=None)
            return base.astimezone(tz)

    monkeypatch.setattr(service_module, "datetime", FixedDateTime)

    db = SimpleNamespace()
    user = SimpleNamespace(
        id=21,
        level=CEFRLevel.B2,
        level_score=82,
        llm_confidence=78,
        level_updated_at=real_datetime(2024, 5, 2, tzinfo=timezone.utc),
    )

    daily_minutes = {
        real_datetime(2024, 5, 5, tzinfo=timezone.utc).date(): 45,
        real_datetime(2024, 5, 6, tzinfo=timezone.utc).date(): 30,
        real_datetime(2024, 5, 7, tzinfo=timezone.utc).date(): 60,
    }

    def fake_get_daily_study_minutes(
        db_arg,
        *,
        user_id,
        start_at,
        end_at,
    ):
        assert db_arg is db
        assert user_id == user.id
        assert start_at.tzinfo is timezone.utc
        assert end_at.tzinfo is timezone.utc
        return daily_minutes

    def fake_get_study_dates_descending(db_arg, *, user_id, limit):
        assert db_arg is db
        assert user_id == user.id
        assert limit == 60
        return [
            real_datetime(2024, 5, 7).date(),
            real_datetime(2024, 5, 6).date(),
            real_datetime(2024, 5, 5).date(),
        ]

    def fake_get_total_study_minutes(db_arg, *, user_id):
        assert db_arg is db
        assert user_id == user.id
        return 600

    ensured = []

    def fake_ensure_achievements(db_arg, *, definitions):
        assert db_arg is db
        ensured.append(tuple(defn["code"] for defn in definitions))

    achievements = [
        SimpleNamespace(
            code="FIRST_SESSION",
            name="첫 학습 달성",
            description="첫 학습 세션을 완료했습니다.",
            category="milestone",
        ),
        SimpleNamespace(
            code="STREAK_3",
            name="3일 연속 학습",
            description="",
            category="streak",
        ),
        SimpleNamespace(
            code="TOTAL_300",
            name="누적 5시간 학습",
            description="",
            category="time",
        ),
    ]

    def fake_list_achievements(db_arg):
        assert db_arg is db
        return achievements

    awarded = {
        "FIRST_SESSION": real_datetime(2024, 5, 1, tzinfo=timezone.utc),
    }

    def fake_ensure_user_achievement(db_arg, *, user_id, achievement_code):
        assert db_arg is db
        assert user_id == user.id
        awarded.setdefault(achievement_code, real_datetime(2024, 5, 7, tzinfo=timezone.utc))
        return SimpleNamespace(
            achievement_code=achievement_code,
            achieved_at=awarded[achievement_code],
        )

    def fake_list_user_achievements(db_arg, *, user_id):
        assert db_arg is db
        assert user_id == user.id
        return [
            SimpleNamespace(
                achievement_code=code,
                achieved_at=achieved_at,
            )
            for code, achieved_at in awarded.items()
        ]

    monkeypatch.setattr(crud, "get_daily_study_minutes", fake_get_daily_study_minutes)
    monkeypatch.setattr(crud, "get_study_dates_descending", fake_get_study_dates_descending)
    monkeypatch.setattr(crud, "get_total_study_minutes", fake_get_total_study_minutes)
    monkeypatch.setattr(crud, "ensure_achievements", fake_ensure_achievements)
    monkeypatch.setattr(crud, "list_achievements", fake_list_achievements)
    monkeypatch.setattr(crud, "ensure_user_achievement", fake_ensure_user_achievement)
    monkeypatch.setattr(crud, "list_user_achievements", fake_list_user_achievements)

    service = StatsService()
    stats = service.get_user_stats(db=db, user=user)

    assert ensured  # ensure definitions were seeded
    assert set(awarded.keys()) == {"FIRST_SESSION", "STREAK_3", "TOTAL_300"}
    assert stats.total_time_spent_minutes == 600
    assert stats.current_level.level == CEFRLevel.B2
    assert stats.current_level.level_score == 82

    assert stats.streak.weekly_total_minutes == 135
    assert stats.streak.consecutive_days == 3
    assert len(stats.streak.daily_minutes) == 7
    assert stats.streak.daily_minutes[-1].minutes == 60

    achieved = {item.code: item.achieved for item in stats.achievements}
    assert achieved == {
        "FIRST_SESSION": True,
        "STREAK_3": True,
        "TOTAL_300": True,
    }
    first_achievement = next(item for item in stats.achievements if item.code == "FIRST_SESSION")
    assert first_achievement.achieved_at is not None


def test_get_user_stats_handles_no_activity(monkeypatch):
    db = SimpleNamespace()
    user = SimpleNamespace(
        id=99,
        level=CEFRLevel.A1,
        level_score=None,
        llm_confidence=None,
        level_updated_at=None,
    )

    monkeypatch.setattr(crud, "ensure_achievements", lambda *args, **kwargs: None)
    monkeypatch.setattr(crud, "list_achievements", lambda *args, **kwargs: [
        SimpleNamespace(code="FIRST_SESSION", name="첫 학습 달성", description=None, category="milestone")
    ])
    monkeypatch.setattr(crud, "get_daily_study_minutes", lambda *args, **kwargs: {})
    monkeypatch.setattr(crud, "get_study_dates_descending", lambda *args, **kwargs: [])
    monkeypatch.setattr(crud, "get_total_study_minutes", lambda *args, **kwargs: 0)
    monkeypatch.setattr(crud, "ensure_user_achievement", lambda *args, **kwargs: SimpleNamespace(
        achievement_code="FIRST_SESSION",
        achieved_at=None,
    ))
    monkeypatch.setattr(crud, "list_user_achievements", lambda *args, **kwargs: [])

    service = StatsService()
    stats = service.get_user_stats(db=db, user=user)

    assert stats.total_time_spent_minutes == 0
    assert stats.streak.consecutive_days == 0
    assert all(item.minutes == 0 for item in stats.streak.daily_minutes)
    assert stats.achievements[0].achieved is False


def test_calculate_streak_returns_zero_for_empty_list():
    service = StatsService()
    assert service._calculate_streak([]) == 0


def test_stats_crud_functions_with_sqlite():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        user = AppUser(
            username="stats-user",
            hashed_password="hashed",
            nickname="Statsy",
            level=UserCEFRLevel.A1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        db.add_all(
            [
                StudySession(
                    user_id=user.id,
                    started_at=datetime(2024, 5, 5, 10, 0),
                    duration_minutes=30,
                    activity_type="session",
                ),
                StudySession(
                    user_id=user.id,
                    started_at=datetime(2024, 5, 6, 9, 0),
                    duration_minutes=45,
                    activity_type="session",
                ),
            ]
        )
        db.commit()

        crud.ensure_achievements(
            db,
            definitions=[
                {
                    "code": "FIRST_SESSION",
                    "name": "첫 학습 달성",
                    "description": None,
                    "category": "milestone",
                },
                {
                    "code": "TOTAL_300",
                    "name": "누적 5시간 학습",
                    "description": None,
                    "category": "time",
                },
            ],
        )

        window_start = datetime(2024, 5, 1, tzinfo=timezone.utc)
        window_end = datetime(2024, 5, 10, tzinfo=timezone.utc)
        daily = crud.get_daily_study_minutes(
            db,
            user_id=user.id,
            start_at=window_start,
            end_at=window_end,
        )
        normalized_daily = {str(key): value for key, value in daily.items()}
        assert normalized_daily["2024-05-05"] == 30
        assert normalized_daily["2024-05-06"] == 45

        total = crud.get_total_study_minutes(db, user_id=user.id)
        assert total == 75

        dates = crud.get_study_dates_descending(db, user_id=user.id, limit=5)
        normalized_dates = [str(item) for item in dates]
        assert normalized_dates[0] == "2024-05-06"
        assert normalized_dates[1] == "2024-05-05"

        crud.ensure_user_achievement(
            db,
            user_id=user.id,
            achievement_code="FIRST_SESSION",
        )

        achievements = crud.list_achievements(db)
        assert sorted(a.code for a in achievements) == ["FIRST_SESSION", "TOTAL_300"]

        user_achievements = crud.list_user_achievements(db, user_id=user.id)
        assert user_achievements[0].achievement_code == "FIRST_SESSION"
    finally:
        db.close()
