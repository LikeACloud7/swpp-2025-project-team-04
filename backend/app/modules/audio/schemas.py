from pydantic import BaseModel, Field
from typing import List

class AudioGenerateRequest(BaseModel):
    """
    Request body for the /audio/generate endpoint.
    """
    mood: str = Field(..., example="excited")
    theme: str = Field(..., example="sports")

class SentenceTimestamp(BaseModel):
    """
    Individual sentence with timestamp information
    """
    id: int
    start_time: float
    text: str

class FinalAudioResponse(BaseModel):
    """
    Final response with audio file URL and sentence timestamps
    """
    generated_content_id: int
    title: str
    audio_url: str
    sentences: List[SentenceTimestamp]

class GeneratedScriptResponse(BaseModel):
    """
    A temporary response model to show the output of Part 1.
    This will eventually be replaced by the final audio response.
    """
    title: str
    selected_voice_id: str
    selected_voice_name: str
    script: str