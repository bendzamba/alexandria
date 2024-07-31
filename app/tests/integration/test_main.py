from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_get_bookshelves():
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == {"get_bookshelves": "success"}

def test_create_bookshelf():
    body = {'title': 'This is a title', 'description': 'This is a description'}
    response = client.post("/bookshelf", json=body)
    assert response.status_code == 200
    assert response.json() == {"create_bookshelf": "success"}

    response = client.post("/bookshelf")
    assert response.status_code == 422

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

def test_get_books():
    response = client.get("/books")
    assert response.status_code == 200
    assert response.json() == {"get_books": "success"}

def test_create_book():
    body = {'title': 'This is a title', 'author': 'John Doe', 'year': 2000, 'category': 'Biography'}
    response = client.post("/book", json=body)
    assert response.status_code == 200
    assert response.json() == {"create_book": "success"}

    response = client.post("/book")
    assert response.status_code == 422

def test_get_book():
    book_id = 1
    response = client.get(f"/book/{book_id}")
    assert response.status_code == 200
    assert response.json() == {"get_book " + str(book_id): "success"}