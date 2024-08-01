from fastapi import APIRouter, Depends, Path
from typing import Annotated
from app.models.book import Book, BookUpdate
from app.services.openlibrary import OpenLibrary
from app.db.sqllite import get_db

openlibrary = OpenLibrary()

router = APIRouter()

@router.get("/")
def get_books(
    db = Depends(get_db)
):
    return db.execute('SELECT * FROM books').fetchall()

@router.get("/{book_id}")
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM books WHERE id = ?', values=(book_id,)).fetchone()

@router.post("/")
async def create_book(
    book: Book,
    db = Depends(get_db)
):
    search_results = await openlibrary.search(book=book)

    olid = openlibrary.find_olid(olid_response=search_results)

    if olid is None:
        return {"No cover found"}
    
    cover_image = "https://covers.openlibrary.org/b/olid/{olid}-M.jpg".format(olid=olid)
    
    cursor = db.execute(query='INSERT INTO books (title, author, year, category, cover_image) VALUES (?, ?, ?, ?, ?)', values=(book.title, book.author, book.year, book.category, cover_image))
    book_id = cursor.lastrowid
    return {"message": f"New book id: {book_id}"}

@router.patch("/{book_id}")
def update_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to update")],
    book: BookUpdate,
    db = Depends(get_db)
):
    update_fields = []
    parameters = []
    
    for attribute in BookUpdate.__fields__.keys():
        book_dict = book.__dict__
        if book_dict[attribute] is not None:
            update_fields.append(f"{attribute} = ?")
            parameters.append(book_dict[attribute])

    query = f"UPDATE books SET {', '.join(update_fields)} WHERE id = ?"
    parameters.append(book_id)
    db.execute(query=query, values=parameters)
    return {"message": f"Book id {book_id} has been updated"}

@router.delete("/{book_id}")
def delete_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db = Depends(get_db)
):
    db.execute(query='DELETE FROM books WHERE id = ?', values=(book_id))
    return {f"Book {book_id} has been deleted"}
