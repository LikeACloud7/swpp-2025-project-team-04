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


# 서비스 팩토리
def get_level_system_service(db: Session = Depends(get_db)):
    return LevelSystemService(db)


@router.post("/session-feedback")
def submit_session_feedback(
    feedback: schemas.SessionFeedbackRequest,
    current_user=Depends(get_current_user),
    service: LevelSystemService = Depends(get_level_system_service),
):
    logger.info(
        "Session feedback - user: %d, gen_content_id: %d, data: %s",
        current_user.id,
        feedback.generated_content_id,
        feedback.model_dump(exclude_none=True)
    )

    result = service.update_level(user=current_user, feedback_request_payload=feedback)

    logger.info(
        "Level update result - user: %d, result: %s",
        current_user.id,
        result,
    )
    return result
