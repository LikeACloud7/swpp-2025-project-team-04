from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.config import get_db
from ...core.exceptions import UserNotFoundException
from ..users import crud as user_crud
from . import schemas
from ...core.logger import logger
from .service import LevelSystemService
from ...core.auth import oauth2_scheme, verify_token, TokenType

router = APIRouter(prefix="/level-system", tags=["level-system"])


def get_current_user(token=Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token.credentials, TokenType.ACCESS_TOKEN)
    username = payload["username"]
    user = user_crud.get_user_by_username(db, username)
    if not user:
        raise UserNotFoundException()
    return user


@router.post("/session-feedback")
def submit_session_feedback(
    feedback: schemas.SessionFeedbackRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(
        "Session feedback - user: %d, gen_content_id: %d, data: %s",
        current_user.id,
        feedback.generated_content_id,
        feedback.model_dump(exclude_none=True)
    )

    result = LevelSystemService.update_level_by_feedback(
        db=db,
        user=current_user,
        feedback_request_payload=feedback
    )

    logger.info(
        "Level update result - user: %d, result: %s",
        current_user.id,
        result,
    )
    return result


@router.post("/initial-survey")
def submit_initial_survey(
    survey: schemas.InitialSurveyRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """결과를 제출하여 사용자의 초기 레벨을 설정합니다."""
    logger.info(
        "Initial survey - user: %d, tests_count: %d",
        current_user.id,
        len(survey.tests)
    )

    result = LevelSystemService.initialize_level(
        db=db,
        user=current_user,
        initial_survey_payload=survey
    )

    logger.info(
        "Level initialization result - user: %d, result: %s",
        current_user.id,
        result,
    )
    return result


@router.post("/initial-survey-with-skip")
def submit_initial_survey_with_skip(
    manual_level: schemas.InitialSurveySkipRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """초기 설문조사를 건너뛰고 수동으로 레벨을 설정합니다."""
    logger.info(
        "Manual level setting - user: %d, level=%.1f",
        current_user.id,
        manual_level.level,
    )

    result = LevelSystemService.set_manual_level(
        db=db,
        user=current_user,
        manual_level_payload=manual_level
    )

    logger.info(
        "Manual level set result - user: %d, result: %s",
        current_user.id,
        result,
    )
    return result
