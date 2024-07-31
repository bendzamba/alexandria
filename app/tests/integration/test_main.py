from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_get_bookshelves():
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == {"get_bookshelves": "success"}

def test_create_bookshelf():
    response = client.post("/bookshelf")
    assert response.status_code == 200
    assert response.json() == {"create_bookshelf": "success"}

def test_get_bookshelf():
    bookshelf_id = 1
    response = client.get(f"/bookshelf/{bookshelf_id}")
    assert response.status_code == 200
    assert response.json() == {"get_bookshelf " + str(bookshelf_id): "success"}

def test_get_bookshelf_books():
    bookshelf_id = 1
    response = client.get(f"/bookshelf/{bookshelf_id}/books")
    assert response.status_code == 200
    assert response.json() == {"get_bookshelf_books "  + str(bookshelf_id): "success"}