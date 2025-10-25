from pydantic import BaseModel, Field

class AudioGenerateRequest(BaseModel):
    """
    Request body for the /audio/generate endpoint.
    """
    mood: str = Field(..., example="excited")
    theme: str = Field(..., example="sports")

class GeneratedScriptResponse(BaseModel):
    """
    A temporary response model to show the output of Part 1.
    This will eventually be replaced by the final audio response.
    """
    selected_voice_id: str
    selected_voice_name: str
    script: str