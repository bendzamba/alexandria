import pytest
import random
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.bookshelf import Bookshelf, SortKey # noqa: F401
from app.models.book import Book, ReadStatus # noqa: F401
from app.models.book_bookshelf import BookBookshelfLink # noqa: F401

@pytest.fixture(scope="function")
def create_bookshelf():
    return Bookshelf(
        title="My Bookshelf",
        description="This is a great bookshelf!",
        sort_key="id",
        sort_direction="ascending"
    )

@pytest.fixture(scope="function")
def create_book():
    return Book(
        title="The Great American Novel",
        author="John Doe",
        year=2000,
        olid="abcde",
        read_status=random.choice([e.value for e in ReadStatus]),
        cover_uri="http://www.example.com"
    )

@pytest.fixture(scope="function")
def create_bookshelf_book(create_bookshelf, create_book):
    return BookBookshelfLink(
        book_id=create_book.id,
        bookshelf_id=create_bookshelf.id
    )

@pytest.fixture(scope="function")
def seed_bookshelf(session: Session, create_bookshelf):
    session.add(create_bookshelf)
    session.commit()
    yield session

@pytest.fixture(scope="function")
def seed_book(session: Session, create_book):
    session.add(create_book)
    session.commit()
    yield session

@pytest.fixture(scope="function")
def seed_bookshelf_book(session: Session, seed_book, seed_bookshelf, create_bookshelf_book):
    session.add(create_bookshelf_book)
    session.commit()
    yield session


def test_get_bookshelves_empty(client: TestClient):
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == []


def test_get_bookshelves_populated(client: TestClient, seed_bookshelf, create_bookshelf):
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == [create_bookshelf.model_dump()]


def test_get_bookshelf_exists(client: TestClient, seed_bookshelf, create_bookshelf):
    response = client.get(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 200
    assert response.json() == create_bookshelf.model_dump() | {"books": []}


def test_get_bookshelf_not_exists(client: TestClient):
    response = client.get("/bookshelves/12345")
    assert response.status_code == 404
    assert response.json() == {"detail": "Bookshelf not found"}


def test_create_bookshelf_correct(client: TestClient):
    body = {
        "title": "Bookshelf Title",
        "description": "Bookshelf Description",
        "sort_key": "id",
        "sort_direction": "ascending"
    }
    response = client.post("/bookshelves", json=body)
    assert response.status_code == 201
    assert response.json() is None

    created_bookshelf_id = 1
    response = client.get(f"/bookshelves/{created_bookshelf_id}")
    assert response.status_code == 200
    assert response.json() == body | {"id": created_bookshelf_id, "books": []}


def test_create_bookshelf_incorrect(client: TestClient):
    body = {
        "titel": "Bookshelf Title",
        "dercsiprtion": "Bookshelf Description",
        "stor_kye": "id"
    }
    response = client.post("/bookshelves", json=body)
    assert response.status_code == 422


def test_patch_bookshelf_exists(client: TestClient, seed_bookshelf, create_bookshelf):
    body = {"title": "New Bookshelf Title", "description": "New Bookshelf Description"}
    response = client.patch(f"/bookshelves/{create_bookshelf.id}", json=body)
    assert response.status_code == 204

    response = client.get(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 200
    assert response.json() == create_bookshelf.model_dump() | body | {"books": []}


def test_patch_bookshelf_not_exists(client: TestClient, seed_bookshelf, create_bookshelf):
    body = {"title": "New Bookshelf Title", "description": "New Bookshelf Description"}
    response = client.patch("/bookshelves/12345", json=body)
    assert response.status_code == 404


def test_get_sort_keys(client: TestClient):
    response = client.get("bookshelves/sort_keys/")
    assert response.status_code == 200
    assert response.json() == [e.value for e in SortKey]


def test_delete_bookshelf(client: TestClient, seed_bookshelf, create_bookshelf):
    response = client.delete(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 204


def test_delete_bookshelf_not_exists(client: TestClient, seed_bookshelf, create_bookshelf):
    response = client.delete("/bookshelves/12345")
    assert response.status_code == 404


def test_add_book_to_bookshelf(client: TestClient, seed_bookshelf, seed_book, create_bookshelf, create_book):
    body = {"book_ids": [create_book.id]}
    response = client.post(f"/bookshelves/{create_bookshelf.id}/books", json=body)
    assert response.status_code == 201
    assert response.json() is None

    response = client.get(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 200
    assert response.json() == create_bookshelf.model_dump() | {"books": [create_book.model_dump()]}


def test_add_book_to_bookshelf_bookshelf_not_exists(client: TestClient, seed_bookshelf, seed_book, create_bookshelf, create_book):
    body = {"book_ids": [create_book.id]}
    response = client.post("/bookshelves/12345/books", json=body)
    assert response.status_code == 404


def test_add_book_to_bookshelf_book_not_exists(client: TestClient, seed_bookshelf, seed_book, create_bookshelf, create_book):
    body = {"book_ids": [12345]}
    response = client.post(f"/bookshelves/{create_bookshelf.id}/books", json=body)
    assert response.status_code == 404


def test_remove_book_from_bookshelf(client: TestClient, seed_bookshelf_book, create_book, create_bookshelf):
    response = client.delete(f"/bookshelves/{create_bookshelf.id}/books/{create_book.id}")
    assert response.status_code == 204

    response = client.get(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 200
    assert response.json() == create_bookshelf.model_dump() | {"books": []}


def test_remove_book_from_bookshelf_bookshelf_not_exists(client: TestClient, seed_bookshelf, seed_book, create_bookshelf, create_book):
    response = client.delete(f"/bookshelves/12345/books/{create_book.id}")
    assert response.status_code == 404


def test_remove_book_from_bookshelf_book_not_exists(client: TestClient, seed_bookshelf, seed_book, create_bookshelf, create_book):
    response = client.delete(f"/bookshelves/{create_bookshelf.id}/books/12345")
    assert response.status_code == 404


def test_delete_book_cascade(client: TestClient, seed_bookshelf_book, create_book, create_bookshelf):
    # Test deletion
    response = client.delete(f"/books/{create_book.id}")
    assert response.status_code == 204

    # Deletion should have cascaded to delete book from bookshelf
    response = client.get(f"/bookshelves/{create_bookshelf.id}")
    assert response.status_code == 200
    assert response.json() == create_bookshelf.model_dump() | {"books": []}


def test_get_books_not_on_bookshelf(client: TestClient, seed_bookshelf, seed_book, create_book, create_bookshelf):
    response = client.get(f"/bookshelves/{create_bookshelf.id}/books/exclude/")
    assert response.status_code == 200
    assert response.json() == [create_book.model_dump()]
