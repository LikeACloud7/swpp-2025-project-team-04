from sqlalchemy.orm import Session
from typing import List
from .model import VocabEntry


def add_vocab_entry(
    db: Session,
    *,
    user_id: int,
    word: str,
    example_sentence: str | None = None,
    pos: str | None = None,
    meaning: str | None = None,
    example_sentence_url: str | None = None,
) -> VocabEntry:
    # normalize word to lowercase for consistent storage and matching
    normalized_word = word.strip().lower() if isinstance(word, str) else word

    entry = VocabEntry(
        user_id=user_id,
        word=normalized_word,
        example_sentence=example_sentence,
        pos=pos,
        meaning=meaning,
        example_sentence_url=example_sentence_url,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_vocab_for_user(db: Session, user_id: int) -> List[VocabEntry]:
    return db.query(VocabEntry).filter(VocabEntry.user_id == user_id).all()
