from fastapi import APIRouter, Depends, File, Path, UploadFile, status, HTTPException
from typing import Annotated, Optional
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
from app.utils.dependencies import form_or_json
from sqlmodel import Session, select
import magic

ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/gif"}
MAX_ALLOWED_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB

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
    book_create: BookCreate = form_or_json(BookCreate),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    open_library=Depends(get_open_library)
):
    # We are creating a book with an Open Library ID for the book cover image
    if "olid" in book_create and book_create.olid is not None:
        await open_library.fetch_image_from_olid(book_create.olid)

    # We are creating a book with a directly uploaded book cover image
    if file:
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(await file.read(2048))
        if file_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PNG, JPEG, and GIF files are allowed."
            )
        # Reset file pointer to the beginning
        await file.seek(0)
        contents = await file.read()
        if len(contents) > MAX_ALLOWED_IMAGE_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeded. Maximum allowed size is 5MB."
            )
        print(contents)

    db_book = Book.model_validate(book_create)
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

    if "olid" in book_data and book_data.olid is not None:
        await open_library.fetch_image_from_olid(book_update.olid)

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
