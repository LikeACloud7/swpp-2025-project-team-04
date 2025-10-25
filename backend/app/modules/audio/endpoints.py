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
    response_model=schemas.GeneratedScriptResponse 
    # response_model=schemas.FinalAudioResponse # <-- Your eventual goal
)
async def generate_audio(
    request: schemas.AudioGenerateRequest,
    current_user: User = Depends(get_current_user) # <-- Use real dependency
):
    """
    Generates a 3-5 minute audio script based on mood, theme,
    and user level, and selects a challenging voice.
    
    (Part 1 is implemented. Part 2 is pending.)
    """
    try:
        script, selected_voice = await AudioService.AudioService.generate_audio_script(
            request=request,
            user=current_user
        )
        
        # --- PART 2: AUDIO CREATION (To-Do) ---
        # You would now call the ElevenLabs API here using:
        # - script
        # - selected_voice["voice_id"]
        # ----------------------------------------

        # For now, just return the result of Part 1
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