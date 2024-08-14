from fastapi import APIRouter, Depends, Path, status, HTTPException
from typing import Annotated, List
from app.models.bookshelf import Bookshelf, BookshelfUpdate
from app.models.book import BookIds
from app.db.sqlite import get_db

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
def get_bookshelves(
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM bookshelves').fetchall()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bookshelf(
    bookshelf: Bookshelf,
    db = Depends(get_db)
):
    db.execute(query='INSERT INTO bookshelves (title, description) VALUES (?, ?)', values=(bookshelf.title, bookshelf.description))
    return None

@router.get("/{bookshelf_id}", status_code=status.HTTP_200_OK)
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM bookshelves WHERE id = ?', values=(bookshelf_id,)).fetchone()

@router.patch("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
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
    return None

@router.delete("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to delete")],
    db = Depends(get_db)
):
    db.execute(query='DELETE FROM bookshelves WHERE id = ?', values=(bookshelf_id,))
    return None

@router.get("/{bookshelf_id}/books", status_code=status.HTTP_200_OK)
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf whose books we want to see")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT books.* FROM books JOIN bookshelves_books ON books.id = bookshelves_books.book_id WHERE bookshelves_books.bookshelf_id = ?', values=(bookshelf_id,)).fetchall()

@router.get("/{bookshelf_id}/books/exclude", status_code=status.HTTP_200_OK)
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf for which we want to see books NOT on the shelf")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT books.* FROM books WHERE books.id NOT IN (SELECT books.id FROM books JOIN bookshelves_books ON books.id = bookshelves_books.book_id WHERE bookshelves_books.bookshelf_id = ?)', values=(bookshelf_id,)).fetchall()

@router.post("/{bookshelf_id}/books", status_code=status.HTTP_201_CREATED)
def add_book_to_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to add a book to.")],
    book_ids: BookIds,
    db = Depends(get_db)
):
    # TODO should be able to roll this back on partial success
    try:
        for book_id in book_ids.book_ids:
            db.execute(
                query='INSERT INTO bookshelves_books (bookshelf_id, book_id) VALUES (?, ?)',
                values=(bookshelf_id, book_id,)
            )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Error adding books to bookshelf")
    return None

@router.delete("/{bookshelf_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book_from_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to delete a book from")],
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db = Depends(get_db)
):
    db.execute(query='DELETE FROM bookshelves_books WHERE bookshelf_id = ? AND book_id = ?', values=(bookshelf_id,book_id,))
    return None
