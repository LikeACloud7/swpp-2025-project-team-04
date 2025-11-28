from datetime import date, datetime
from typing import Iterable, Mapping, Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from .models import Achievement, StudySession, UserAchievement


def get_daily_study_minutes(
    db: Session,
    *,
    user_id: int,
    start_at: datetime,
    end_at: datetime,
) -> Mapping[date, int]:
    rows = (
        db.query(
            func.date(StudySession.started_at).label("study_date"),
            func.coalesce(func.sum(StudySession.duration_minutes), 0).label("total_minutes"),
        )
        .filter(
            StudySession.user_id == user_id,
            StudySession.started_at >= start_at,
            StudySession.started_at < end_at,
        )
        .group_by(func.date(StudySession.started_at))
        .all()
    )
    return {row.study_date: int(row.total_minutes) for row in rows}


def get_total_study_minutes(db: Session, *, user_id: int) -> int:
    total = (
        db.query(func.coalesce(func.sum(StudySession.duration_minutes), 0))
        .filter(StudySession.user_id == user_id)
        .scalar()
    )
    return int(total or 0)


def get_study_dates_descending(
    db: Session,
    *,
    user_id: int,   
    limit: int,
) -> Sequence[date]:
    rows = (
        db.query(func.date(StudySession.started_at).label("study_date"))
        .filter(StudySession.user_id == user_id)
        .group_by(func.date(StudySession.started_at))
        .order_by(func.date(StudySession.started_at).desc())
        .limit(limit)
        .all()
    )
    return [row.study_date for row in rows]


def ensure_achievements(
    db: Session,
    *,
    definitions: Iterable[dict],
) -> None:
    if not definitions:
        return

    codes = [item["code"] for item in definitions]
    if not codes:
        return

    existing_codes = {
        code
        for (code,) in db.query(Achievement.code).filter(Achievement.code.in_(codes)).all()
    }
    created = False
    for item in definitions:
        if item["code"] in existing_codes:
            continue
        record = Achievement(
            code=item["code"],
            name=item["name"],
            description=item.get("description"),
            category=item.get("category"),
        )
        db.add(record)
        created = True

    if created:
        db.commit()


def list_achievements(db: Session) -> Sequence[Achievement]:
    return db.query(Achievement).order_by(Achievement.code).all()


def list_user_achievements(db: Session, *, user_id: int) -> Sequence[UserAchievement]:
    return (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )


def ensure_user_achievement(
    db: Session,
    *,
    user_id: int,
    achievement_code: str,
) -> UserAchievement:
    record = (
        db.query(UserAchievement)
        .filter(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_code == achievement_code,
        )
        .first()
    )
    if record is not None:
        return record

    record = UserAchievement(
        user_id=user_id,
        achievement_code=achievement_code,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def insert_study_session(
    db: Session,
    *,
    user_id: int,
    duration_minutes: int,
    activity_type: str | None = None,
) -> StudySession:
    """Insert a StudySession record and return it."""
    record = StudySession(
        user_id=user_id,
        duration_minutes=duration_minutes,
        activity_type=activity_type,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
