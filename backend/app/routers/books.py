from fastapi import APIRouter, Depends, Path, status, HTTPException
from typing import Annotated
from app.models.book import (
    Book,
    BookCreate,
    BookUpdate,
    BookPublic,
    BookPublicWithBookshelves,
    BookIds
)
from app.models.openlibrary import Works
from app.models.exception import ExceptionHandler
from app.services.open_library.factory import get_open_library
from app.db.sqlite import get_db
from app.utils.book_cover import get_book_cover_handler
from sqlmodel import Session, select

from app.models.image import Image

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookPublic])
def get_books(db: Session = Depends(get_db)):
    books = db.exec(select(Book)).all()
    return [BookPublic.model_validate(book).model_dump() for book in books]


@router.get(
    "/{book_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookPublicWithBookshelves,
)
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")],
    db: Session = Depends(get_db)
):
    book = db.get(Book, book_id)

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book_public_with_bookshelves = BookPublicWithBookshelves.model_validate(book)

    return book_public_with_bookshelves.model_dump()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(
    book_create: BookCreate,
    db: Session = Depends(get_db),
    book_cover_handler = Depends(get_book_cover_handler),
):
    db_book = Book.model_validate(book_create) 

    # Handle book cover
    # This may raise an Exception if a file upload is invalid
    # We hold on committing the book until we validate this
    image = await book_cover_handler(book_create_or_update=book_create)

    db.add(db_book)
    db.commit()

    if image is not None:  
        db.refresh(db_book)
        image.book_id = db_book.id
        db.add(image)
        db.commit()
    
    return None


@router.patch("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_book(
    book_id: Annotated[int, Path(title="The ID of the book to update")],
    book_update: BookUpdate,
    db: Session = Depends(get_db),
    book_cover_handler = Depends(get_book_cover_handler),
):
    db_book = db.get(Book, book_id)

    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found") 

    # Handle book cover
    # This may raise an Exception if a file upload is invalid
    # We hold on committing the book until we validate this
    new_image = await book_cover_handler(book_create_or_update=book_update)

    if book_update.file:
        del book_update.file

    if book_update.olid:
        del book_update.olid

    book_data = book_update.model_dump(exclude_unset=True)

    db_book.sqlmodel_update(book_data)
    db.add(db_book)

    if new_image:
        # Set the new image's book_id
        new_image.book_id = book_id
        # Check if an existing image is associated with this book
        existing_image = db.exec(select(Image).where(Image.book_id == book_id)).first()
        if existing_image:
            # Delete the old image if it differs from the new one
            db.delete(existing_image)
            # TODO delete previously uploaded image if there is one?
            db.commit()
        # Add the new image
        db.add(new_image)

    db.commit()

    return None


# This route needs to appear before the one below so `bulk` is not interpreted as a `book_id`
@router.delete("/bulk", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_book(
    bulk_delete: BookIds,
    db: Session = Depends(get_db)
):
    book_ids = bulk_delete.book_ids
    statement = select(Book).where(Book.id.in_(book_ids))
    books_to_delete = db.exec(statement).all()

    if not books_to_delete:
        raise HTTPException(status_code=404, detail="Books not found")
    
    for book in books_to_delete:
        db.delete(book)

    db.commit()

    return None


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db: Session = Depends(get_db)
):
    book = db.get(Book, book_id)

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(book)
    db.commit()

    return None


@router.get("/search/{title}", status_code=status.HTTP_200_OK)
async def search_by_title(
    title: Annotated[str, Path(title="The title we are searching for")],
    open_library=Depends(get_open_library)
):
    results: Works | ExceptionHandler = await open_library.search_by_title(title=title)

    if isinstance(results, ExceptionHandler):
        raise HTTPException(status_code=results.status_code, detail=results.message)

    return results.model_dump()
