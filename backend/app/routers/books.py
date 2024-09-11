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
from app.services.openlibrary import get_open_library
from app.db.sqlite import get_db
from app.utils.image import Image
from sqlmodel import Session, select

image = Image()

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookPublic])
def get_books(db: Session = Depends(get_db)):
    books = db.exec(select(Book)).all()
    return books


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
    return book


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(
    book_create: BookCreate,
    db: Session = Depends(get_db),
    open_library=Depends(get_open_library)
):
    await open_library.fetch_image_from_olid(book_create.olid)
    cover_uri = open_library.get_cover_uri()
    db_book = Book.model_validate(book_create, update={"cover_uri": cover_uri})
    db.add(db_book)
    db.commit()
    return None


@router.patch("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_book(
    book_id: Annotated[int, Path(title="The ID of the book to update")],
    book_update: BookUpdate,
    db: Session = Depends(get_db),
    open_library=Depends(get_open_library)
):
    db_book = db.get(Book, book_id)
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    book_data = book_update.model_dump(exclude_unset=True)

    if "olid" in book_data:
        await open_library.fetch_image_from_olid(book_update.olid)
        cover_uri = open_library.get_cover_uri()
        book_data.update({"cover_uri": cover_uri})

    db_book.sqlmodel_update(book_data)
    db.add(db_book)
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
