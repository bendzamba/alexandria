from fastapi import APIRouter, Depends, Path, status, HTTPException
from typing import Annotated
from app.models.book import (
    Book,
    BookCreate,
    BookUpdate,
    BookPublic,
    BookPublicWithBookshelves,
)
from app.models.openlibrary import Works
from app.services.openlibrary import OpenLibrary
from app.db.sqlite import DB
from app.utils.image import Image
from sqlmodel import Session, select

openlibrary = OpenLibrary()
image = Image()

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookPublic])
def get_books(db=Depends(DB)):
    with Session(db.get_engine()) as session:
        books = session.exec(select(Book)).all()
        return books


@router.get(
    "/{book_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookPublicWithBookshelves,
)
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")], db=Depends(DB)
):
    with Session(db.get_engine()) as session:
        book = session.get(Book, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(book_create: BookCreate, db=Depends(DB)):
    await openlibrary.fetch_image_from_olid(book_create.olid)
    cover_uri = openlibrary.get_cover_uri()

    with Session(db.get_engine()) as session:
        db_book = Book.model_validate(book_create, update={"cover_uri": cover_uri})
        session.add(db_book)
        session.commit()

    return None


@router.patch("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to update")],
    book_update: BookUpdate,
    db=Depends(DB),
):
    with Session(db.get_engine()) as session:
        db_book = session.get(Book, book_id)
        if not db_book:
            raise HTTPException(status_code=404, detail="Book not found")

        book_data = book_update.model_dump(exclude_unset=True)

        if book_update.olid:
            await openlibrary.fetch_image_from_olid(book_update.olid)
            cover_uri = openlibrary.get_cover_uri()
            book_data.update({"cover_uri": cover_uri})

        db_book.sqlmodel_update(book_data)
        session.add(db_book)
        session.commit()

    return None


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to delete")], db=Depends(DB)
):
    with Session(db.get_engine()) as session:
        book = session.get(Book, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        session.delete(book)
        session.commit()

    return None


@router.get("/search/{title}", status_code=status.HTTP_200_OK)
async def search_by_title(
    title: Annotated[str, Path(title="The title we are searching for")]
):
    search_results: Works = await openlibrary.search_by_title(title=title)

    if not search_results:
        return {}

    return search_results.model_dump()
