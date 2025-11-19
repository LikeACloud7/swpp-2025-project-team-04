from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.modules.stats import crud
from app.modules.users.models import User, CEFRLevel as UserCEFR


def _add_user(session, username: str = "tester") -> User:
    user = User(
        username=username,
        hashed_password="secret",
        nickname="Tester",
        level=UserCEFR.A2,
        lexical_level=40.0,
        syntactic_level=40.0,
        speed_level=40.0,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def test_stats_crud_flow(sqlite_session):
    user = _add_user(sqlite_session)
    start = datetime.now(timezone.utc) - timedelta(days=1)

    # Insert a pair of sessions via CRUD helper.
    crud.insert_study_session(sqlite_session, user_id=user.id, duration_minutes=15, activity_type="listening")
    crud.insert_study_session(sqlite_session, user_id=user.id, duration_minutes=30, activity_type="speaking")

    results = crud.get_daily_study_minutes(
        sqlite_session,
        user_id=user.id,
        start_at=start - timedelta(days=1),
        end_at=start + timedelta(days=3),
    )
    assert results  # mapping keyed by date

    total = crud.get_total_study_minutes(sqlite_session, user_id=user.id)
    assert total == 45

    dates = crud.get_study_dates_descending(sqlite_session, user_id=user.id, limit=5)
    assert dates and dates[0] >= dates[-1]

    # Ensure achievements creation skips duplicates and records new items.
    definitions = [
        {"code": "ACH_ONE", "name": "One", "description": "first"},
        {"code": "ACH_TWO", "name": "Two", "description": "second"},
    ]
    crud.ensure_achievements(sqlite_session, definitions=definitions)
    crud.ensure_achievements(sqlite_session, definitions=definitions)  # idempotent

    achievements = crud.list_achievements(sqlite_session)
    assert {ach.code for ach in achievements} == {"ACH_ONE", "ACH_TWO"}

    # Grant user achievement; duplicated grant should return same record.
    earned = crud.ensure_user_achievement(sqlite_session, user_id=user.id, achievement_code="ACH_ONE")
    again = crud.ensure_user_achievement(sqlite_session, user_id=user.id, achievement_code="ACH_ONE")
    assert earned.id == again.id

    user_achievements = crud.list_user_achievements(sqlite_session, user_id=user.id)
    assert [ua.achievement_code for ua in user_achievements] == ["ACH_ONE"]
