# app/modules/audio/endpoints.py

from fastapi import APIRouter, Depends, HTTPException
from . import schemas
from . import service as AudioService
from ..users.models import User
from ..users.endpoints import get_current_user


router = APIRouter()

@router.post(
    "/test-generate",
    response_model=schemas.GeneratedScriptResponse 
)
async def test_generate_audio(
    request: schemas.AudioGenerateRequest
):
    """
    Test endpoint without authentication - generates audio script with dummy user
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
        script, selected_voice = await AudioService.AudioService.generate_audio_script(
            request=request,
            user=dummy_user
        )
        
        return schemas.GeneratedScriptResponse(
            selected_voice_id=selected_voice["voice_id"],
            selected_voice_name=selected_voice["name"],
            script=script
        )

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