# app/modules/audio/endpoints.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
import os
from . import schemas
from . import service as AudioService
from ..users.models import User
from ..users.endpoints import get_current_user


router = APIRouter()

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