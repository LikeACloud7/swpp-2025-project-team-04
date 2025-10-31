from datetime import date, datetime, time, timedelta, timezone
from typing import Dict, List, Sequence

from sqlalchemy.orm import Session

from ..users.models import User
from . import crud, schemas

_DEFAULT_ACHIEVEMENTS: tuple[Dict[str, str], ...] = (
    {
        "code": "FIRST_SESSION",
        "name": "첫 학습 달성",
        "description": "첫 학습 세션을 완료했습니다.",
        "category": "milestone",
    },
    {
        "code": "STREAK_3",
        "name": "3일 연속 학습",
        "description": "3일 연속으로 학습했습니다.",
        "category": "streak",
    },
    {
        "code": "TOTAL_300",
        "name": "누적 5시간 학습",
        "description": "누적 300분 이상 학습했습니다.",
        "category": "time",
    },
)


class StatsService:
    def get_user_stats(
        self,
        *,
        db: Session,
        user: User,
    ) -> schemas.UserStatsResponse:
        now = datetime.now(timezone.utc)
        today = now.date()
        week_start_date = today - timedelta(days=6)
        week_start = self._start_of_day(week_start_date)
        week_end = self._start_of_day(today + timedelta(days=1))

        crud.ensure_achievements(db, definitions=_DEFAULT_ACHIEVEMENTS)
        achievement_defs = crud.list_achievements(db)
        definition_codes = {definition.code for definition in achievement_defs}

        daily_minutes_map = crud.get_daily_study_minutes(
            db,
            user_id=user.id,
            start_at=week_start,
            end_at=week_end,
        )
        daily_minutes = []
        cursor = week_start_date
        while cursor <= today:
            minutes = int(daily_minutes_map.get(cursor, 0))
            daily_minutes.append(
                schemas.DailyStudyMinutes(
                    date=cursor,
                    minutes=max(0, minutes),
                )
            )
            cursor += timedelta(days=1)

        weekly_total_minutes = sum(item.minutes for item in daily_minutes)

        activity_dates = crud.get_study_dates_descending(
            db,
            user_id=user.id,
            limit=60,
        )
        consecutive_days = self._calculate_streak(activity_dates)

        total_time_spent = crud.get_total_study_minutes(db, user_id=user.id)

        unlock_candidates: List[str] = []
        if total_time_spent > 0:
            unlock_candidates.append("FIRST_SESSION")
        if consecutive_days >= 3:
            unlock_candidates.append("STREAK_3")
        if total_time_spent >= 300:
            unlock_candidates.append("TOTAL_300")

        for code in unlock_candidates:
            if code in definition_codes:
                crud.ensure_user_achievement(
                    db,
                    user_id=user.id,
                    achievement_code=code,
                )

        user_achievements = crud.list_user_achievements(db, user_id=user.id)
        user_lookup = {
            record.achievement_code: record for record in user_achievements
        }

        achievement_statuses: List[schemas.AchievementStatus] = []
        for definition in achievement_defs:
            unlocked = user_lookup.get(definition.code)
            achievement_statuses.append(
                schemas.AchievementStatus(
                    code=definition.code,
                    name=definition.name,
                    description=definition.description,
                    category=definition.category,
                    achieved=unlocked is not None,
                    achieved_at=getattr(unlocked, "achieved_at", None)
                    if unlocked is not None
                    else None,
                )
            )

        current_level = schemas.LevelProgress(
            level=getattr(user, "level", None),
            level_score=getattr(user, "level_score", None),
            llm_confidence=getattr(user, "llm_confidence", None),
            updated_at=getattr(user, "level_updated_at", None),
        )

        streak_summary = schemas.StudyStreakSummary(
            consecutive_days=consecutive_days,
            weekly_total_minutes=weekly_total_minutes,
            daily_minutes=daily_minutes,
        )

        return schemas.UserStatsResponse(
            streak=streak_summary,
            current_level=current_level,
            total_time_spent_minutes=total_time_spent,
            achievements=achievement_statuses,
        )

    @staticmethod
    def _start_of_day(target: date) -> datetime:
        return datetime.combine(target, time.min, tzinfo=timezone.utc)

    @staticmethod
    def _calculate_streak(activity_dates: Sequence[date]) -> int:
        if not activity_dates:
            return 0

        activity_set = set(activity_dates)
        most_recent = max(activity_set)
        streak = 0

        current = most_recent
        while current in activity_set:
            streak += 1
            current = current - timedelta(days=1)
        return streak
