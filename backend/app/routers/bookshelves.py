from fastapi import APIRouter, Depends, Path, status, HTTPException
from typing import Annotated, List
from app.models.bookshelf import (
    Bookshelf,
    BookshelfCreate,
    BookshelfUpdate,
    BookshelfPublic,
    BookshelfPublicWithBooks,
)
from app.models.book import BookIds, Book
from app.models.book_bookshelf import BookBookshelfLink
from app.db.sqlite import get_db
from sqlmodel import Session, select

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookshelfPublic])
def get_bookshelves(db=Depends(get_db)):
    with Session(db.get_engine()) as session:
        bookshelves = session.exec(select(Bookshelf)).all()
        return bookshelves


@router.get(
    "/{bookshelf_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookshelfPublicWithBooks,
)
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        bookshelf = session.get(Bookshelf, bookshelf_id)
        if not bookshelf:
            raise HTTPException(status_code=404, detail="Bookshelf not found")
        return bookshelf


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bookshelf(bookshelf_create: BookshelfCreate, db=Depends(get_db)):
    with Session(db.get_engine()) as session:
        db_bookshelf = Bookshelf.model_validate(bookshelf_create)
        session.add(db_bookshelf)
        session.commit()

    return None


@router.patch("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to update")],
    bookshelf: BookshelfUpdate,
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        db_bookshelf = session.get(Bookshelf, bookshelf_id)
        if not db_bookshelf:
            raise HTTPException(status_code=404, detail="Bookshelf not found")
        bookshelf_data = bookshelf.model_dump(exclude_unset=True)
        db_bookshelf.sqlmodel_update(bookshelf_data)
        session.add(db_bookshelf)
        session.commit()

    return None


@router.delete("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to delete")],
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        bookshelf = session.get(Bookshelf, bookshelf_id)
        if not bookshelf:
            raise HTTPException(status_code=404, detail="Bookshelf not found")
        session.delete(bookshelf)
        session.commit()

    return None


@router.get("/{bookshelf_id}/books/exclude/", status_code=status.HTTP_200_OK)
def get_books_not_on_bookshelf(
    bookshelf_id: Annotated[
        int,
        Path(
            title="The ID of the bookshelf for which we want to see books NOT on the shelf"
        ),
    ],
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        # Create a subquery to select book IDs that are in the bookshelf
        subquery = (
            select(BookBookshelfLink.book_id)
            .where(BookBookshelfLink.bookshelf_id == bookshelf_id)
            .distinct()
        )

        # Main query to select books not in the subquery results
        query = select(Book).where(Book.id.not_in(subquery))

        # Execute the query and fetch all results
        result = session.exec(query)
        books = result.fetchall()

    return books


@router.post("/{bookshelf_id}/books/", status_code=status.HTTP_201_CREATED)
def add_book_to_bookshelf(
    bookshelf_id: Annotated[
        int, Path(title="The ID of the bookshelf to add a book to.")
    ],
    book_ids: BookIds,
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        # Fetch the bookshelf
        bookshelf = session.get(Bookshelf, bookshelf_id)
        if not bookshelf:
            raise HTTPException(status_code=404, detail="Bookshelf not found")

        # Fetch all the books
        books_to_add = []
        for book_id in book_ids.book_ids:
            book = session.get(Book, book_id)
            if not book:
                raise HTTPException(
                    status_code=404, detail=f"Book with ID {book_id} not found"
                )

            books_to_add.append(book)

        # Add all the books to the bookshelf's books list
        bookshelf.books.extend(books_to_add)

        # Commit the changes
        session.commit()

    return None


@router.delete(
    "/{bookshelf_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_book_from_bookshelf(
    bookshelf_id: Annotated[
        int, Path(title="The ID of the bookshelf to delete a book from")
    ],
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db=Depends(get_db),
):
    with Session(db.get_engine()) as session:
        # Retrieve the Bookshelf instance
        bookshelf = session.get(Bookshelf, bookshelf_id)
        if not bookshelf:
            raise HTTPException(status_code=404, detail="Bookshelf not found")

        # Retrieve the Book instance to remove
        book_to_remove = session.get(Book, book_id)
        if not book_to_remove:
            raise HTTPException(status_code=404, detail="Book not found")

        # Remove the book from the bookshelf
        if book_to_remove in bookshelf.books:
            bookshelf.books.remove(book_to_remove)
            session.commit()

    return None
