import pytest
import random
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.book import Book, ReadStatus # noqa: F401

@pytest.fixture(scope="function")
def create_book():
    return Book(
        title="The Great American Novel",
        author="John Doe",
        year=2000,
        olid="abcde",
        read_status=random.choice([e.value for e in ReadStatus]),
    )


@pytest.fixture(scope="function")
def seed_book(session: Session, create_book):
    session.add(create_book)
    session.commit()
    yield session


def test_get_books_empty(client: TestClient):
    response = client.get("/books")
    assert response.status_code == 200
    assert response.json() == []


def test_get_books_populated(client: TestClient, seed_book, create_book):
    with patch("app.models.book.image_handler") as mock_image_handler:
        mock_s3_uri = "https://mock-s3-bucket.s3.amazonaws.com/abcde.jpg"
        mock_image_handler.get_image_uri.return_value = mock_s3_uri
        response = client.get("/books")
        assert response.status_code == 200
        cover = {"cover_uri": mock_s3_uri}
        assert response.json() == [create_book.model_dump() | cover]


def test_get_book_exists(client: TestClient, seed_book, create_book):
    with patch("app.models.book.image_handler") as mock_image_handler:
        mock_s3_uri = "https://mock-s3-bucket.s3.amazonaws.com/abcde.jpg"
        mock_image_handler.get_image_uri.return_value = mock_s3_uri
        response = client.get(f"/books/{create_book.id}")
        assert response.status_code == 200
        cover = {"cover_uri": mock_s3_uri}
        assert response.json() == create_book.model_dump() | {"bookshelves": []} | cover


def test_get_book_not_exists(client: TestClient):
    response = client.get("/books/12345")
    assert response.status_code == 404


def test_create_book_correct(client: TestClient):
    body = {
        "title": "Book Title",
        "author": "Book Author",
        "year": 2000,
        "olid": "abcde",
        "read_status": random.choice([e.value for e in ReadStatus])
    }
    response = client.post("/books", json=body)
    assert response.status_code == 201
    assert response.json() is None


def test_create_book_incorrect(client: TestClient):
    body = {
        "tidal": "Book Title",
        "other": "Book Author",
        "hear": 2000,
        "ovid": "abcde",
        "bread_status": random.choice([e.value for e in ReadStatus])
    }
    response = client.post("/books", json=body)
    assert response.status_code == 422


def test_patch_book_exists(client: TestClient, seed_book, create_book):
    with patch("app.models.book.image_handler") as mock_image_handler:
        mock_s3_uri = "https://mock-s3-bucket.s3.amazonaws.com/abcde.jpg"
        mock_image_handler.get_image_uri.return_value = mock_s3_uri
        body = {"title": "The Worst American Novel", "year": 2024}
        response = client.patch(f"/books/{create_book.id}", json=body)
        assert response.status_code == 204

        response = client.get(f"/books/{create_book.id}")
        assert response.status_code == 200
        cover = {"cover_uri": mock_s3_uri}
        assert response.json() == create_book.model_dump() | body | {"bookshelves": []} | cover


def test_patch_book_not_exists(client: TestClient, seed_book):
    body = {"title": "The Worst American Novel", "year": 2024}
    response = client.patch("/books/12345", json=body)
    assert response.status_code == 404


def test_delete_book(client: TestClient, seed_book, create_book):
    response = client.delete(f"/books/{create_book.id}")
    assert response.status_code == 204


def test_delete_book_not_exists(client: TestClient, seed_book, create_book):
    response = client.delete("/books/12345")
    assert response.status_code == 404


def test_search_book_by_title_exists(client: TestClient):
    title = "The+Grapes+Of+Wrath"
    expected = [{
        "title": "title",
        "author_name": "author",
        "first_publish_year": 2000,
        "olids": ["abcde", "fghij"]
    }]
    response = client.get(f"/books/search/{title}")
    assert response.status_code == 200
    assert response.json() == expected


def test_search_book_by_title_not_exists(client: TestClient):
    title = "Nonexistent+Book+Title"
    expected = {"detail": "No results found. Please try a different search."}
    response = client.get(f"/books/search/{title}")
    assert response.status_code == 404
    assert response.json() == expected