from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_bookshelves():
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == []


def test_create_bookshelf():
    body = {"title": "Bookshelf Title", "description": "Bookshelf Description"}
    response = client.post("/bookshelves", json=body)
    assert response.status_code == 201
    assert response.json() == None


def test_get_bookshelves_after_create():
    result = [
        {"id": 1, "title": "Bookshelf Title", "description": "Bookshelf Description"}
    ]
    response = client.get("/bookshelves")
    assert response.status_code == 200
    assert response.json() == result


def test_get_bookshelf():
    bookshelf_id = 1
    result = {
        "id": bookshelf_id,
        "title": "Bookshelf Title",
        "description": "Bookshelf Description",
    }
    response = client.get(f"/bookshelves/{bookshelf_id}")
    assert response.status_code == 200
    assert response.json() == result


def test_patch_bookshelf():
    body = {"title": "New Bookshelf Title", "description": "New Bookshelf Description"}
    bookshelf_id = 1
    response = client.patch(f"/bookshelves/{bookshelf_id}", json=body)
    assert response.status_code == 204


def test_get_bookshelf_after_patch():
    bookshelf_id = 1
    result = {
        "id": bookshelf_id,
        "title": "New Bookshelf Title",
        "description": "New Bookshelf Description",
    }
    response = client.get(f"/bookshelves/{bookshelf_id}")
    assert response.status_code == 200
    assert response.json() == result


def test_get_books():
    response = client.get("/books")
    assert response.status_code == 200
    assert response.json() == []


def test_create_book():
    body = {"title": "Book Title", "author": "Book Author", "year": 2000}
    response = client.post("/books", json=body)
    assert response.status_code == 201
    assert response.json() == None


def test_get_books_after_create():
    book_id = 1
    result = [
        {
            "id": book_id,
            "title": "Book Title",
            "author": "Book Author",
            "year": 2000,
            "cover_image": "https://covers.openlibrary.org/b/olid/12345-M.jpg",
        }
    ]
    response = client.get("/books")
    assert response.status_code == 200
    assert response.json() == result


def test_get_book():
    book_id = 1
    result = {
        "id": book_id,
        "title": "Book Title",
        "author": "Book Author",
        "year": 2000,
        "cover_image": "https://covers.openlibrary.org/b/olid/12345-M.jpg",
    }
    response = client.get(f"/books/{book_id}")
    assert response.status_code == 200
    assert response.json() == result


def test_patch_book():
    body = {
        "title": "New Book Title",
        "author": "New Book Author",
        "year": 1999,
        "cover_image": "https://covers.openlibrary.org/b/olid/12345-M.jpg",
    }
    book_id = 1
    response = client.patch(f"/books/{book_id}", json=body)
    assert response.status_code == 204


def test_get_book_after_patch():
    book_id = 1
    result = {
        "id": book_id,
        "title": "New Book Title",
        "author": "New Book Author",
        "year": 1999,
        "cover_image": "https://covers.openlibrary.org/b/olid/12345-M.jpg",
    }
    response = client.get(f"/books/{book_id}")
    assert response.status_code == 200
    assert response.json() == result


def test_get_bookshelf_books():
    bookshelf_id = 1
    response = client.get(f"/bookshelves/{bookshelf_id}/books")
    assert response.status_code == 200
    assert response.json() == []


def test_add_book_to_bookshelf():
    bookshelf_id = 1
    book_id = 1
    body = {"book_id": book_id}
    response = client.post(f"/bookshelves/{bookshelf_id}/books", json=body)
    assert response.status_code == 201
    assert response.json() == None


def test_get_bookshelf_books_after_add():
    bookshelf_id = 1
    book_id = 1
    result = [
        {
            "id": book_id,
            "title": "New Book Title",
            "author": "New Book Author",
            "year": 1999,
            "cover_image": "https://covers.openlibrary.org/b/olid/12345-M.jpg",
        }
    ]
    response = client.get(f"/bookshelves/{bookshelf_id}/books")
    assert response.status_code == 200
    assert response.json() == result


def test_remove_book_from_bookshelf():
    bookshelf_id = 1
    book_id = 1
    response = client.delete(f"/bookshelves/{bookshelf_id}/books/{book_id}")
    assert response.status_code == 204


def test_get_bookshelf_books_after_remove():
    bookshelf_id = 1
    response = client.get(f"/bookshelves/{bookshelf_id}/books")
    assert response.status_code == 200
    assert response.json() == []


def test_delete_book_cascade():
    bookshelf_id = 1
    book_id = 1
    body = {"book_id": book_id}

    # Add book back to bookshelf
    client.post(f"/bookshelves/{bookshelf_id}/books", json=body)

    # Test deletion
    response = client.delete(f"/books/{book_id}")
    assert response.status_code == 204

    # Deletion should have cascaded to delete book from bookshelf
    response = client.get(f"/bookshelves/{bookshelf_id}/books")
    assert response.status_code == 200
    assert response.json() == []


def test_delete_bookshelf():
    bookshelf_id = 1
    response = client.delete(f"/bookshelves/{bookshelf_id}")
    assert response.status_code == 204
