from fastapi import APIRouter, Depends, Path
from typing import Annotated
from app.models.bookshelf import Bookshelf, BookshelfUpdate
from app.models.book import BookId
from app.db.sqllite import get_db

router = APIRouter()

@router.get("/")
def get_bookshelves(
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM bookshelves').fetchall()

@router.post("/")
def create_bookshelf(
    bookshelf: Bookshelf,
    db = Depends(get_db)
):
    cursor = db.execute(query='INSERT INTO bookshelves (title, description) VALUES (?, ?)', values=(bookshelf.title, bookshelf.description))
    bookshelf_id = cursor.lastrowid
    return {"message": f"New bookshelf id: {bookshelf_id}"}

@router.get("/{bookshelf_id}")
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM bookshelves WHERE id = ?', values=(bookshelf_id,)).fetchone()

@router.patch("/{bookshelf_id}")
def update_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to update")],
    bookshelf: BookshelfUpdate,
    db = Depends(get_db)
):
    update_fields = []
    parameters = []
    
    for attribute in BookshelfUpdate.__fields__.keys():
        bookshelf_dict = bookshelf.__dict__
        if bookshelf_dict[attribute] is not None:
            update_fields.append(f"{attribute} = ?")
            parameters.append(bookshelf_dict[attribute])

    query = f"UPDATE bookshelves SET {', '.join(update_fields)} WHERE id = ?"
    parameters.append(bookshelf_id)
    db.execute(query=query, values=parameters)
    return {"message": f"Bookshelf id {bookshelf_id} has been updated"}

@router.get("/{bookshelf_id}/books")
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT books.* FROM books JOIN bookshelves_books ON books.id = bookshelves_books.book_id WHERE bookshelves_books.bookshelf_id = ?', values=(bookshelf_id,)).fetchall()

@router.post("/{bookshelf_id}/books")
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    book_id: BookId,
    db = Depends(get_db)
):
    db.execute(query='INSERT INTO bookshelves_books (bookshelf_id, book_id) VALUES (?, ?)', values=(bookshelf_id, book_id.book_id))
    return {f"Book {book_id.book_id} has been added to {bookshelf_id}"}

@router.delete("/{bookshelf_id}")
def delete_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to delete")],
    db = Depends(get_db)
):
    print(bookshelf_id)
    db.execute(query='DELETE FROM bookshelves WHERE id = ?', values=(bookshelf_id,))
    return {f"Bookshelf {bookshelf_id} has been deleted"}
