# app/modules/audio/service.py

import os
import json
import random
import re
import base64
import asyncio
from openai import AsyncOpenAI
from fastapi import HTTPException
from elevenlabs import ElevenLabs
from sqlalchemy.orm import Session
from ...core.config import SessionLocal
from ..users.models import User, CEFRLevel
from .schemas import AudioGenerateRequest
from .utils import parse_tts_by_newlines, get_elevenlabs_client
from . import crud
from ..vocab.service import VocabService
from ...core.s3setting import generate_s3_object_key
from ...core.s3setting import upload_audio_to_s3
import time
from app.core.logger import logger
# --- Configuration ---
from ...core.config import settings

def get_openai_client():
    return AsyncOpenAI(api_key=settings.openai_api_key)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VOICES_FILE_PATH = os.path.join(BASE_DIR, "voices.json")

MIN_SCRIPT_WORDS = 100
TARGET_SCRIPT_WORDS = 200
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
    ) -> tuple[str, str]:
        """
        (Special Points 1 & 3)
        Generates a script, ensures it's long enough, and formats
        each sentence on a new line.
        )
        """

        start_total = time.time()  # ⏱ 전체 시작

        voice_detail = (
            f"{selected_voice['name']} (Gender: {selected_voice['tags']['gender']}, "
            f"Accent: {selected_voice['tags']['accent']}, Style: {selected_voice['tags']['style']})"
        )
        
        prompt = f"""
        You are a scriptwriter. Generate a script for an audio narration.
        The script must be between 1 and 2 minutes long (around {TARGET_SCRIPT_WORDS} words).
        The narration will be read by a single speaker: {voice_detail}.
        
        Theme: {theme}
        Mood: {mood}
        User Level: {user_level.value} 
        (This means vocabulary and sentence structure should be appropriate. 
        'A1'/'A2' = simple, 'B1'/'B2' = intermediate, 'C1'/'C2' = complex).

        *** IMPORTANT FORMATTING RULES ***
        1. Start with a title on the first line formatted as: TITLE: [Your Title Here]
        2. Add one blank line after the title.
        3. (Special Point 3) Every single sentence MUST be a new line.
           A sentence ends with a period, question mark, or exclamation mark.
        4. Do NOT include speaker names (e.g., "Narrator:"), scene directions, 
           or any text other than the dialogue itself.
        
        Example format:
        TITLE: Amazing Adventures in Technology
        
        Welcome to our exciting journey into the world of technology.
        Today we will explore fascinating innovations.
        """
        
        generated_script = ""
        for attempt in range(MAX_GENERATION_TRIES):
            try:
                client = get_openai_client()
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
        
        # Parse title and script
        title, script_only = AudioService._parse_title_and_script(generated_script)
        
        sentences = re.split(r'(?<=[.!?])\s+', script_only)
        formatted_script = "\n".join(sentence.strip() for sentence in sentences if sentence.strip())
        
        total_elapsed = time.time() - start_total
        print(f"[TIMER] 🧾 Total script generation took {total_elapsed:.2f}s\n")

        return title, formatted_script

    @staticmethod
    def _parse_title_and_script(content: str) -> tuple[str, str]:
        """
        Parse the generated content to extract title and script separately
        Returns (title, script_without_title)
        """
        lines = content.strip().split('\n')
        
        title = "Untitled Audio"  # Default title
        script_lines = []
        
        for i, line in enumerate(lines):
            if line.strip().startswith("TITLE:"):
                # Extract title
                title = line.strip()[6:].strip()  # Remove "TITLE:" prefix
            elif line.strip() and not line.strip().startswith("TITLE:"):
                # Add non-empty lines to script (skip empty lines after title)
                script_lines.append(line.strip())
        
        script = '\n'.join(script_lines)
        return title, script

    @staticmethod
    def _clean_filename(title: str) -> str:
        """
        Clean title for use as filename (remove special characters)
        """
        # Replace spaces with underscores and remove special characters
        cleaned = re.sub(r'[^\w\s-]', '', title)
        cleaned = re.sub(r'[-\s]+', '_', cleaned)
        return cleaned[:50]  # Limit length

    @staticmethod
    async def _generate_audio_with_timestamps(
        script: str,
        voice_id: str
    ) -> dict:
        """
        Generate audio asynchronously using ElevenLabs API (non-blocking).
        Runs blocking I/O in a thread executor so the event loop remains free.
        """
        try:
            elevenlabs_client = get_elevenlabs_client()
            loop = asyncio.get_event_loop()

            # main change for asyncronous handling
            # run_in_executor() → blocking call in another thread
            response = await loop.run_in_executor(
                None,  
                lambda: elevenlabs_client.text_to_speech.convert_with_timestamps(
                    voice_id=voice_id,
                    text=script,
                    model_id="eleven_multilingual_v2",
                    enable_logging=False,
                ),
            )

            response_dict = response.model_dump()
            sentences_with_timestamps = parse_tts_by_newlines(response_dict)

            return {
                "audio_base_64": response_dict.get("audio_base_64"),
                "sentences": sentences_with_timestamps,
            }

        except Exception as e:
            print(f"Error during audio generation: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate audio: {str(e)}"
            )






    @classmethod
    async def generate_audio_script(
        cls, 
        request: AudioGenerateRequest, 
        user: User
    ) -> tuple[str, str, dict]:
        
        all_voices = cls._load_voices()
        
        user_level = user.level 
        
        selected_voice = cls._select_voice_algorithmically(
            all_voices=all_voices,
            user_level=user_level
        )
        
        title, script = await cls._generate_script(
            mood=request.mood,
            theme=request.theme,
            user_level=user_level,
            selected_voice=selected_voice
        )
        
        return title, script, selected_voice

    @classmethod
    async def generate_full_audio_with_timestamps(
        cls, 
        request: AudioGenerateRequest, 
        user: User
    ) -> dict:
        """
        Complete pipeline: Generate script + voice selection + audio + timestamps
        Returns audio_base_64 and sentences with timestamps
        """
        total_start = time.time()



        # === Step 1: Generate script and select voice ===
        logger.info("=== Step 1: Generate script and select voice ===")
        logger.info(f"User Info | id={user.id}, username={user.username}, level={user.level}")
        start_script = time.time()

        title, script, selected_voice = await cls.generate_audio_script(request, user)

        logger.info(f"Script generation completed in {time.time() - start_script:.2f}s")
        logger.debug(f"Title: {title}")
        logger.debug(f"Script Preview: {script[:200]}...")





        # === Step 1.5: DB placeholder entry ===
        generated_id = None
        try:
            db: Session = SessionLocal()
            content = crud.insert_generated_content(
                db,
                user_id=user.id,
                title=title,
                script_data=script,
                audio_url=None,
                response_json=None,
            )
            generated_id = content.generated_content_id
            logger.info(f"Inserted placeholder GeneratedContent (id={generated_id})")
        except Exception as e:
            logger.error(f"Failed to insert GeneratedContent: {e}", exc_info=True)
            generated_id = None
    





        # === Step 2-1: Background contextual vocab (Background) ===
        try:
            sentences = cls._split_script_by_newlines(script)
            logger.info(f"Launching contextual vocab processing for {len(sentences)} sentences...")
            asyncio.create_task(VocabService.build_contextual_vocab(sentences, generated_id))
        except Exception as e:
            logger.error(f"Failed to launch VocabService: {e}", exc_info=True)





        # ===Step 2-2: Generate audio with timestamps using ElevenLabs===
        logger.info("=== Step 2: Generate audio with ElevenLabs ===")
        start_audio = time.time()

        audio_result = await cls._generate_audio_with_timestamps(
            script=script,
            voice_id=selected_voice["voice_id"]
        )
        
        logger.info(f"Audio generation took {time.time() - start_audio:.2f}s")





        # === Step 3: Upload to S3 ===
        logger.info("=== Step 3: Upload audio to S3 ===")

        audio_data = base64.b64decode(audio_result["audio_base_64"])
        key = generate_s3_object_key("mp3")
        audio_url = upload_audio_to_s3(audio_data, key)

        logger.info(f"Audio uploaded to S3 | key={key}")

        


        
        

        
        # === Step 4: Response summary ===
        logger.info("=== Step 4: Response generation ===")


        response_payload = {
            "generated_content_id": generated_id,
            "title": title,
            "audio_url": audio_url,
            "sentences": audio_result["sentences"],
        }

        try:
            db = SessionLocal()
            updated = crud.update_generated_content_audio(
                db,
                content_id=generated_id,
                audio_url=audio_url,
                response_json=response_payload, 
            )
            if updated:
                logger.info(f"Updated GeneratedContent with final response for id={generated_id}")
            else:
                logger.warning(f"GeneratedContent not found for id={generated_id}")
        except Exception as e:
            logger.error(f"Failed to update audio_url in DB: {e}", exc_info=True)
        finally:
            db.close()



        elapsed = time.time() - total_start
        logger.info(f"Full pipeline completed in {elapsed:.2f}s")
        
        return response_payload
    

    @staticmethod
    def _split_script_by_newlines(script: str) -> list[str]:
        """
        Split the generated script (already newline-separated by GPT)
        into a clean list of sentences.
        Empty lines and stray whitespace are removed.
        """
        if not isinstance(script, str):
            return []

        # Split by literal newline
        raw_sentences = script.split("\n")

        # Clean and remove empty lines
        sentences = [s.strip() for s in raw_sentences if s.strip()]

        return sentences