# app/modules/audio/endpoints.py

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, RedirectResponse
import boto3
from ...core.config import settings
import os
import json
from sqlalchemy.orm import Session
from . import schemas
from . import service as AudioService
from ..users.models import User
from ..users.endpoints import get_current_user
from ..users.crud import get_user_by_username
from ...core.auth import verify_token, TokenType
from ...core.config import get_db
from ...core.logger import logger

router = APIRouter()

async def get_user_from_token(token: str) -> User | None:
    """
    제공된 토큰을 기반으로 사용자를 조회합니다.
    get_current_user와 동일한 로직을 사용하되 WebSocket 컨텍스트에 맞게 조정
    """
    try:
        # JWT 토큰 검증 (get_current_user와 동일한 로직)
        token_data = verify_token(token, TokenType.ACCESS_TOKEN)
        username = token_data["username"]
        
        # 데이터베이스 세션 생성 (WebSocket에서는 Depends를 사용할 수 없음)
        db = next(get_db())
        try:
            user = get_user_by_username(db, username)
            return user
        finally:
            db.close()
            
    except Exception as e:
        logger.warning(f"토큰 인증 실패: {str(e)}")
        return None


@router.post(
    "/test-generate",
    response_model=schemas.FinalAudioResponse 
)
async def test_generate_audio(
    request: schemas.AudioGenerateRequest
):
    """
    Test endpoint without authentication - generates full audio pipeline with dummy user
    """
    # Create dummy user for testing
    from ..users.models import CEFRLevel
    dummy_user = User(
        id=1,
        username="testuser", 
        hashed_password="dummy",
        nickname="Test User",
        level=CEFRLevel.B1
    )
    
    try:
        # Run the complete pipeline: Script generation + Voice selection + Audio generation + Timestamp parsing
        result = await AudioService.AudioService.generate_full_audio_with_timestamps(
            request=request,
            user=dummy_user
        )
        
        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

@router.post(
    "/generate",
    response_model=schemas.FinalAudioResponse
)
async def generate_audio(
    request: schemas.AudioGenerateRequest,
    current_user: User = Depends(get_current_user) # <-- Use real dependency
):
    """
    Generates a 3-5 minute audio script based on mood, theme,
    and user level, selects a challenging voice, and creates audio with timestamps.
    """
    try:
        # Complete pipeline: Script generation + Voice selection + Audio generation + Timestamp parsing
        result = await AudioService.AudioService.generate_full_audio_with_timestamps(
            request=request,
            user=current_user
        )
        
        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.get(
    "/history",
    response_model=schemas.AudioHistoryListResponse,
)
def list_audio_history(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated user's previously generated audio files (paginated).
    """
    safe_limit = max(1, min(limit, 50))
    safe_offset = max(0, offset)
    items = AudioService.AudioService.list_user_audio_history(
        db,
        user_id=current_user.id,
        limit=safe_limit,
        offset=safe_offset,
    )
    total = AudioService.AudioService.count_user_audio_history(
        db,
        user_id=current_user.id,
    )
    return {
        "items": items,
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
    }

@router.get("/files/{filename}")
async def get_audio_file(filename: str):
    """
    Serve audio files from temporary storage
    """
    # Get the temp audio directory path
    from .service import TEMP_AUDIO_DIR
    
    file_path = os.path.join(TEMP_AUDIO_DIR, filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    # Return the file
    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=filename
    )

@router.websocket("/ws/generate")
async def websocket_generate_audio(websocket: WebSocket):
    """
    WebSocket을 통해 오디오 생성을 스트리밍합니다.
    
    프로토콜:
    1. 클라이언트 연결
    2. 클라이언트 -> 서버: {"type": "auth", "payload": {"token": "..."}}
    3. 서버 -> 클라이언트: {"type": "auth_success"} 또는 {"type": "error"}
    4. 클라이언트 -> 서버: {"type": "generate_audio", "payload": {"mood": "...", "theme": "..."}}
    5. 서버 -> 클라이언트: (반복) {"type": "status_update", "payload": {...}}
    6. 서버 -> 클라이언트: {"type": "generation_complete", "payload": {...}}
    7. 연결 종료
    """
    await websocket.accept()
    logger.info("WebSocket 클라이언트 연결됨.")
    
    current_user: User | None = None
    
    try:
        # 클라이언트로부터 첫 번째 메시지(인증)를 기다립니다.
        auth_message_raw = await websocket.receive_text()
        auth_data = json.loads(auth_message_raw)
        
        if auth_data.get("type") != "auth":
            await websocket.send_json({"type": "error", "payload": {"message": "인증이 필요합니다."}})
            await websocket.close(code=1008) # Policy Violation
            return

        token = auth_data.get("payload", {}).get("token")
        if not token:
            await websocket.send_json({"type": "error", "payload": {"message": "토큰이 제공되지 않았습니다."}})
            await websocket.close(code=1008)
            return

        # 가상 인증 함수 호출
        current_user = await get_user_from_token(token) 
        
        if not current_user:
            await websocket.send_json({"type": "error", "payload": {"message": "유효하지 않은 토큰입니다."}})
            await websocket.close(code=1008)
            return
            
        # 인증 성공 응답
        await websocket.send_json({"type": "auth_success", "payload": {"message": "인증 성공."}})
        logger.info(f"WebSocket 인증 성공: {current_user.username}")

        # --- 단계 7-B: 생성 요청 ---
        # 클라이언트로부터 두 번째 메시지(생성 요청)를 기다립니다.
        request_message_raw = await websocket.receive_text()
        request_data = json.loads(request_message_raw)
        
        if request_data.get("type") != "generate_audio":
            raise ValueError("인증 후 잘못된 요청 타입입니다.")
            
        # Pydantic을 사용한 요청 데이터 검증
        request_payload = schemas.AudioGenerateRequest(**request_data.get("payload", {}))
        
        logger.info(f"{current_user.username} 님의 오디오 생성 요청: {request_payload.model_dump_json()}")

        # --- 단계 7-C: 스트리밍 서비스 호출 ---
        # service.py에 새로 만든 스트리밍 함수를 호출합니다.
        # 이 함수가 알아서 websocket.send_json()을 통해 클라이언트에게 모든 메시지를 보냅니다.
        await AudioService.AudioService.generate_full_audio_streaming(
            request=request_payload,
            user=current_user,
            websocket=websocket
        )

    except WebSocketDisconnect:
        logger.info(f"WebSocket 클라이언트 연결 해제됨: {current_user.username if current_user else 'Unknown'}")
    except Exception as e:
        logger.error(f"WebSocket 엔드포인트 오류: {e}", exc_info=True)
        # 클라이언트가 아직 연결되어 있다면 오류 메시지 전송
        try:
            await websocket.send_json({
                "type": "error",
                "payload": {
                    "step_code": "websocket_connection",
                    "message": f"서버 오류가 발생했습니다: {str(e)}"
                }
            })
        except:
            pass # 이미 연결이 끊겼을 수 있음
    finally:
        # 모든 작업이 끝나면 WebSocket 연결을 닫습니다.
        if websocket.client_state.name == 'CONNECTED':
            await websocket.close()
        logger.info("WebSocket 연결 종료됨.")
