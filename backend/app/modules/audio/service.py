# app/modules/audio/service.py

import os
import json
import random
import re
from openai import AsyncOpenAI
from fastapi import HTTPException
from backend.app.modules.users.models import User, CEFRLevel

from .schemas import AudioGenerateRequest

# --- Configuration ---
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICES_FILE_PATH = os.path.join(BASE_DIR, "voices.json")

MIN_SCRIPT_WORDS = 400
TARGET_SCRIPT_WORDS = 600
MAX_GENERATION_TRIES = 3

# 1. Map CEFR Level to a challenge score range (0-100)
LEVEL_CHALLENGE_MAP = {
    CEFRLevel.A1: (0, 30),
    CEFRLevel.A2: (0, 30),
    CEFRLevel.B1: (30, 70),
    CEFRLevel.B2: (30, 70),
    CEFRLevel.C1: (70, 100),
    CEFRLevel.C2: (70, 100),
}

ACCENT_SCORES = {
    "none": 0,
    "american_standard": 5,
    "british": 40,
    "american_southern": 60,
    "american_urban": 60,
    "british_northern": 80,
    # Add any other accents from your list here
}
DEFAULT_ACCENT_SCORE = 30

STYLE_SCORES = {
    "professional": 0,
    "narration": 5,
    "storyteller": 10,
    "conversational": 20,
    "mellow": 15,
    "chill": 15,
    "elegant": 25,
    "resonant": 25,
    "emotive": 40,
    "playful": 45,
    "husky": 50,
    "versatile": 30,
    "gravelly": 70,
    "quirky": 85,
    # Add any other styles from your list here
}
DEFAULT_STYLE_SCORE = 20

ACCENT_WEIGHT = 0.7  # Accent is the primary challenge factor
STYLE_WEIGHT = 0.3   # Style is a secondary factor


class AudioService:

    @staticmethod
    def _load_voices() -> list[dict]:
        """Loads the voice list from voices.json."""
        try:
            with open(VOICES_FILE_PATH, 'r') as f:
                return json.load(f)["voices"]
        except FileNotFoundError:
            raise HTTPException(status_code=500, detail="voices.json file not found.")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error decoding voices.json.")

    @staticmethod
    def _select_voice_algorithmically(
        all_voices: list[dict], 
        user_level: CEFRLevel
    ) -> dict:
        try:
            min_score, max_score = LEVEL_CHALLENGE_MAP[user_level]
        except KeyError:
            min_score, max_score = (0, 30)
            
        suitable_voices = []
        
        for voice in all_voices:
            tags = voice.get("tags", {})
            accent = tags.get("accent")
            style = tags.get("style")
            
            # Get scores from our maps, with fallbacks
            accent_score = ACCENT_SCORES.get(accent, DEFAULT_ACCENT_SCORE)
            style_score = STYLE_SCORES.get(style, DEFAULT_STYLE_SCORE)
            
            # Calculate final weighted score
            total_score = (accent_score * ACCENT_WEIGHT) + (style_score * STYLE_WEIGHT)
            
            # Add to pool if it's in the user's challenge range
            if min_score <= total_score <= max_score:
                suitable_voices.append(voice)
        
        if not suitable_voices:
            # Fallback: If no voices match the criteria (e.g., C2 user and no
            # high-score voices), just pick a random one from the B1/B2 pool
            # to ensure we always return something.
            print(f"Warning: No voices found for level {user_level.value}. Falling back to B1/B2 range.")
            min_score, max_score = LEVEL_CHALLENGE_MAP[CEFRLevel.B1]
            for voice in all_voices:
                tags = voice.get("tags", {})
                accent = tags.get("accent")
                style = tags.get("style")
                accent_score = ACCENT_SCORES.get(accent, DEFAULT_ACCENT_SCORE)
                style_score = STYLE_SCORES.get(style, DEFAULT_STYLE_SCORE)
                total_score = (accent_score * ACCENT_WEIGHT) + (style_score * STYLE_WEIGHT)
                if min_score <= total_score <= max_score:
                    suitable_voices.append(voice)
        
        if not suitable_voices:
            # Final fallback: just return any voice
            print("Warning: No voices found in fallback. Picking any random voice.")
            return random.choice(all_voices)

        # Success: pick a random voice from the filtered pool
        return random.choice(suitable_voices)


    @staticmethod
    async def _generate_script(
        mood: str, 
        theme: str, 
        user_level: CEFRLevel,
        selected_voice: dict
    ) -> str:
        """
        (Special Points 1 & 3)
        Generates a script, ensures it's long enough, and formats
        each sentence on a new line.
        )
        """
        voice_detail = (
            f"{selected_voice['name']} (Gender: {selected_voice['tags']['gender']}, "
            f"Accent: {selected_voice['tags']['accent']}, Style: {selected_voice['tags']['style']})"
        )
        
        prompt = f"""
        You are a scriptwriter. Generate a script for an audio narration.
        The script must be between 3 and 5 minutes long (around {TARGET_SCRIPT_WORDS} words).
        The narration will be read by a single speaker: {voice_detail}.
        
        Theme: {theme}
        Mood: {mood}
        User Level: {user_level.value}
        (This means vocabulary and sentence structure should be appropriate. 
        'A1'/'A2' = simple, 'B1'/'B2' = intermediate, 'C1'/'C2' = complex).

        *** IMPORTANT FORMATTING RULES ***
        1. (Special Point 3) Every single sentence MUST be a new line.
           A sentence ends with a period, question mark, or exclamation mark.
        2. Do NOT include speaker names (e.g., "Narrator:"), scene directions, 
           or any text other than the dialogue itself.
        """
        
        generated_script = ""
        for attempt in range(MAX_GENERATION_TRIES):
            try:
                response = await client.chat.completions.create(
                    model="gpt-4o",
                    messages=[{"role": "system", "content": prompt}]
                )
                script_content = response.choices[0].message.content.strip()
                
                word_count = len(script_content.split())
                
                if word_count >= MIN_SCRIPT_WORDS:
                    generated_script = script_content
                    break
                
                print(f"Attempt {attempt + 1}: Script too short ({word_count} words). Retrying...")

            except Exception as e:
                print(f"Error during script generation: {e}")
                
        if not generated_script:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to generate script of sufficient length after {MAX_GENERATION_TRIES} attempts."
            )
        
        sentences = re.split(r'(?<=[.!?])\s+', generated_script)
        formatted_script = "\n".join(sentence.strip() for sentence in sentences if sentence.strip())
        
        return formatted_script

    @classmethod
    async def generate_audio_script(
        cls, 
        request: AudioGenerateRequest, 
        user: User
    ) -> tuple[str, dict]:
        """
        Main service function for Part 1.
        (Updated to use the new algorithmic voice selection)
        """
        all_voices = cls._load_voices()
        
        user_level = user.level 
        
        selected_voice = cls._select_voice_algorithmically(
            all_voices=all_voices,
            user_level=user_level
        )
        
        script = await cls._generate_script(
            mood=request.mood,
            theme=request.theme,
            user_level=user_level,
            selected_voice=selected_voice
        )
        
        return script, selected_voice