from fastapi import APIRouter, Depends, HTTPException, Header, Response
from sqlalchemy.orm import Session
from ...core.config import get_db
from ..audio.model import GeneratedContent
from . import crud as vocab_crud
from . import schemas as vocab_schemas
from ...core.auth import verify_token, TokenType
from ..users.crud import get_user_by_username
from ...core.exceptions import (
    InvalidAuthHeaderException,
    UserNotFoundException,
    AuthTokenExpiredException,
    InvalidTokenException,
    InvalidTokenTypeException,
    ScriptVocabsNotFoundException,
)

router = APIRouter(prefix="/vocabs", tags=["vocab"])


def get_current_user(authorization: str = Header(), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise InvalidAuthHeaderException()

    access_token = authorization[7:]

    token_data = verify_token(access_token, TokenType.ACCESS_TOKEN)
    username = token_data["username"]

    user = get_user_by_username(db, username)
    if not user:
        raise UserNotFoundException()

    return user


@router.get("/{content_id}/sentences/{index}")
def get_contextual_word(content_id: int, index: int, word: str | None = None, db: Session = Depends(get_db)):
    """Return contextual JSON for a single word inside a sentence.

    Optional query param `word` can be provided: /.../sentences/{index}?word=enjoy
    If `word` is provided, return only that word's contextual JSON; otherwise return the whole sentence object.
    """
    content = (
        db.query(GeneratedContent)
        .filter(GeneratedContent.generated_content_id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(status_code=404, detail="generated content not found")

    script_vocabs = content.script_vocabs
    if not script_vocabs:
        raise ScriptVocabsNotFoundException()

    sentences = script_vocabs.get("sentences") if isinstance(script_vocabs, dict) else None
    if not sentences or not isinstance(sentences, list):
        raise HTTPException(status_code=404, detail="no sentences found in script_vocabs")

    # find sentence by its 'index' field
    target_sentence = None
    for sent in sentences:
        # each sentence is expected to have an 'index' field
        if sent.get("index") == index:
            target_sentence = sent
            break

    if not target_sentence:
        raise HTTPException(status_code=404, detail="sentence index not found")

    # If no specific word requested, return full sentence (backwards-compatible)
    if not word:
        return target_sentence

    requested_word = word
    words = target_sentence.get("words") or []
    # case-insensitive match to the 'word' field
    for w in words:
        if isinstance(w.get("word"), str) and w.get("word").lower() == requested_word.lower():
            return w

    # not found
    raise HTTPException(status_code=404, detail="word not found in sentence")


@router.post("/{content_id}/sentences/{index}", status_code=201,
             responses={404: {"description": "not found"}})
def add_word_to_vocab(content_id: int, index: int, request: vocab_schemas.AddVocabRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Add a word to the current user's personal vocab.

    Behavior:
    - locate the generated content by `content_id`
    - find the sentence with `index` inside `script_vocabs` saved on the generated content
    - store a new VocabEntry for the current user with the provided `word`, the sentence text as example, and the word-level pos/meaning
    """
    content = (
        db.query(GeneratedContent)
        .filter(GeneratedContent.generated_content_id == content_id)
        .first()
    )

    if not content:
        raise HTTPException(status_code=404, detail="generated content not found")

    script_vocabs = content.script_vocabs
    if not script_vocabs or not isinstance(script_vocabs, dict):
        raise ScriptVocabsNotFoundException()

    sentences = script_vocabs.get("sentences")
    if not sentences or not isinstance(sentences, list):
        raise HTTPException(status_code=404, detail="no sentences found in script_vocabs")

    target_sentence = None
    for sent in sentences:
        if sent.get("index") == index:
            target_sentence = sent
            break

    if not target_sentence:
        raise HTTPException(status_code=404, detail="sentence index not found")

    # find the specific word object inside the sentence to store only word-level data
    requested_word = request.word
    word_obj = None
    for w in target_sentence.get("words", []):
        if isinstance(w.get("word"), str) and w.get("word").lower() == requested_word.lower():
            # keep only word/pos/meaning
            word_obj = {k: v for k, v in w.items() if k in ("word", "pos", "meaning")}
            break

    if not word_obj:
        raise HTTPException(status_code=404, detail="word not found in sentence")

    # create vocab entry storing only the word-level contextual data (pos and meaning)
    vocab_crud.add_vocab_entry(
        db,
        user_id=current_user.id,
        word=request.word,
        example_sentence=target_sentence.get("text"),
        pos=word_obj.get("pos"),
        meaning=word_obj.get("meaning"),
        example_sentence_url=None,
    )

    # Return no body, only 201 Created
    return Response(status_code=201)


@router.get("/me", response_model=list[vocab_schemas.VocabEntryResponse])
def get_my_vocab(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    entries = vocab_crud.get_vocab_for_user(db, current_user.id)
    return entries
