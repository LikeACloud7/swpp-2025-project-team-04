from __future__ import annotations

from app.modules.users import crud as user_crud
from app.modules.vocab import crud as vocab_crud


def _create_user(session, username: str = "demo"):
    return user_crud.create_user(session, username=username, hashed_password="pw")


def test_add_and_list_vocab_entries(sqlite_session):
    user = _create_user(sqlite_session)
    vocab_crud.add_vocab_entry(
        sqlite_session,
        user_id=user.id,
        word="  Hello ",
        example_sentence="Hello world!",
        meaning="greeting",
    )
    entries = vocab_crud.get_vocab_for_user(sqlite_session, user_id=user.id)
    assert len(entries) == 1
    assert entries[0].word == "hello"


def test_delete_vocab_entry(sqlite_session):
    user = _create_user(sqlite_session)
    entry = vocab_crud.add_vocab_entry(sqlite_session, user_id=user.id, word="bye")
    entry_id = entry.id
    assert vocab_crud.delete_vocab_entry(sqlite_session, entry_id=entry_id, user_id=user.id) is True
    other_user = _create_user(sqlite_session, username="other")
    assert vocab_crud.delete_vocab_entry(sqlite_session, entry_id=entry_id, user_id=other_user.id) is False
