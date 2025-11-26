from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

class AudioGenerateRequest(BaseModel):
    """
    Request body for the /audio/generate endpoint.
    """
    style: str = Field(..., example="podcast")
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


class GeneratedContentListItem(BaseModel):
    """
    Summary of a GeneratedContent row for list views.
    """
    model_config = ConfigDict(from_attributes=True)

    generated_content_id: int
    title: str
    audio_url: Optional[str] = None
    script_data: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AudioHistoryListResponse(BaseModel):
    """
    Paginated response containing a user's previously generated audios.
    """
    items: List[GeneratedContentListItem]
    total: int
    limit: int
    offset: int
