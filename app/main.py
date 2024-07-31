from typing import Annotated
from app.models.bookshelf import Bookshelf
from app.models.book import Book, BookId
from app.services.openlibrary import OpenLibrary
from fastapi import FastAPI, Path
from app.db.sqllite import DB

openlibrary = OpenLibrary()
db = DB()
app = FastAPI()

@app.get("/bookshelves")
def get_bookshelves():
    return db.execute(query='SELECT * FROM bookshelves').fetchall()

@app.post("/bookshelves")
def create_bookshelf(
    bookshelf: Bookshelf
):
    cursor = db.execute(query='INSERT INTO bookshelves (title, description) VALUES (?, ?)', values=(bookshelf.title, bookshelf.description))
    bookshelf_id = cursor.lastrowid
    return {"message": f"New bookshelf id: {bookshelf_id}"}

@app.get("/bookshelves/{bookshelf_id}")
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")]
):
    return db.execute(query='SELECT * FROM bookshelves WHERE id = ?', values=(bookshelf_id,)).fetchone()

@app.get("/bookshelves/{bookshelf_id}/books")
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")]
):
    return db.execute(query='SELECT books.* FROM books JOIN bookshelves_books ON books.id = bookshelves_books.book_id WHERE bookshelves_books.bookshelf_id = ?', values=(bookshelf_id,)).fetchall()

@app.post("/bookshelves/{bookshelf_id}/books")
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    book_id: BookId
):
    db.execute(query='INSERT INTO bookshelves_books (bookshelf_id, book_id) VALUES (?, ?)', values=(bookshelf_id, book_id.book_id))
    return {f"Book {book_id} has been added to {bookshelf_id}"}

@app.get("/books")
def get_books():
    return db.execute('SELECT * FROM books').fetchall()

@app.get("/books/{book_id}")
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")]
):
    return db.execute(query='SELECT * FROM books WHERE id = ?', values=(book_id,)).fetchone()

@app.post("/books")
async def create_book(
    book: Book
):
    search_results = await openlibrary.search(book=book)

    olid = openlibrary.find_olid(olid_response=search_results)

    if olid is None:
        return {"No cover found"}
    
    cover_image = "https://covers.openlibrary.org/b/olid/{olid}-M.jpg".format(olid=olid)
    
    cursor = db.execute(query='INSERT INTO books (title, author, year, category, cover_image) VALUES (?, ?, ?, ?, ?)', values=(book.title, book.author, book.year, book.category, cover_image))
    book_id = cursor.lastrowid
    return {"message": f"New book id: {book_id}"}