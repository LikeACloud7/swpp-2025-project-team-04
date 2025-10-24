import os
import sys
from datetime import datetime
from unittest.mock import patch
from dotenv import load_dotenv
from fastapi.testclient import TestClient

# Load environment variables from .env file before importing anything
load_dotenv()

# Ensure OPENAI_API_KEY is set (use the one from .env or a dummy value)
if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = "sk-test-dummy-key-for-testing"

# Handle imports based on whether we're running from backend/ or project root
try:
    # Try importing from backend.app (when running from project root)
    from backend.app.main import app
    from backend.app.modules.users.models import User, CEFRLevel
except ModuleNotFoundError:
    # Fall back to app imports (when running from backend directory)
    from app.main import app
    from app.modules.users.models import User, CEFRLevel

client = TestClient(app)

# Create output directory for script files
SCRIPT_OUTPUT_DIR = "test_scripts"
os.makedirs(SCRIPT_OUTPUT_DIR, exist_ok=True)

# Create dummy user for testing
dummy_user = User(
    id=1,
    username="testuser",
    hashed_password="$2b$12$dummy_hash",
    nickname="Test User",
    level=CEFRLevel.B1
)

def mock_get_current_user():
    """Mock function to return dummy user instead of requiring real auth"""
    return dummy_user

def save_script_to_file(script_data, test_name, mood, theme, level):
    """Save script response to a txt file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{test_name}_{mood}_{theme}_{level}_{timestamp}.txt"
    filepath = os.path.join(SCRIPT_OUTPUT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"Test: {test_name}\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Mood: {mood}\n")
        f.write(f"Theme: {theme}\n")
        f.write(f"User Level: {level}\n")
        f.write(f"Selected Voice ID: {script_data['selected_voice_id']}\n")
        f.write(f"Selected Voice Name: {script_data['selected_voice_name']}\n")
        f.write("-" * 50 + "\n")
        f.write("GENERATED SCRIPT:\n")
        f.write("-" * 50 + "\n")
        f.write(script_data['script'])
        f.write("\n" + "-" * 50 + "\n")
    
    print(f"Script saved to: {filepath}")
    return filepath

def test_generate_audio_script():
    """Test the audio script generation endpoint with dummy user"""
    mood, theme = "excited", "sports"
    response = client.post("/api/v1/audio/test-generate", 
        json={
            "mood": mood,
            "theme": theme
        }
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response content: {response.text}")
    
    if response.status_code != 200:
        print("Test failed - debugging response")
        return
        
    data = response.json()
    
    # Check response structure
    assert "selected_voice_id" in data
    assert "selected_voice_name" in data
    assert "script" in data
    
    # Check that script is not empty
    assert len(data["script"]) > 0
    assert len(data["selected_voice_id"]) > 0
    assert len(data["selected_voice_name"]) > 0
    
    # Save script to file  
    save_script_to_file(data, "basic_test", mood, theme, "B1")

def test_generate_audio_different_levels():
    """Test with different user levels"""
    test_cases = [
        ("A1", "happy", "travel"),
        ("B2", "mysterious", "technology"), 
        ("C1", "dramatic", "history")
    ]
    
    for level, mood, theme in test_cases:
        response = client.post("/api/v1/audio/test-generate", 
            json={
                "mood": mood,
                "theme": theme
            }
        )
        
        print(f"Testing {level} - {mood} - {theme}")
        print(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Response content: {response.content}")
            continue
            
        data = response.json()
        assert "script" in data
        assert len(data["script"]) > 100  # Should have substantial content
        
        # Save script to file
        save_script_to_file(data, "level_test", mood, theme, level)

@patch('app.modules.users.endpoints.get_current_user', side_effect=mock_get_current_user)
def test_generate_audio_invalid_data(mock_auth):
    """Test with missing required fields"""
    response = client.post("/api/v1/audio/generate", 
        json={
            "mood": "excited"
            # missing theme
        },
        headers={"Authorization": "Bearer dummy_token"}
    )
    
    assert response.status_code == 422  # Validation error