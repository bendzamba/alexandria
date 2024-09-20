from fastapi import APIRouter, Depends, Path, status, HTTPException
from typing import Annotated
from app.models.bookshelf import (
    Bookshelf,
    BookshelfCreate,
    BookshelfUpdate,
    BookshelfPublic,
    BookshelfPublicWithBooks,
    SortKey
)
from app.models.book import BookIds, Book, BookPublic
from app.models.book_bookshelf import BookBookshelfLink
from app.db.sqlite import get_db
from sqlmodel import Session, select

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK, response_model=list[BookshelfPublic])
def get_bookshelves(db: Session = Depends(get_db)):
    bookshelves = db.exec(select(Bookshelf)).all()
    return bookshelves


# This route needs to appear before the one below so `sort_keys` is not interpreted as a `bookshelf_id`
@router.get("/sort_keys", status_code=status.HTTP_200_OK, response_model=list[str])
def get_bookshelf_sort_keys():
    return [key.value for key in SortKey]


@router.get(
    "/{bookshelf_id}",
    status_code=status.HTTP_200_OK,
    response_model=BookshelfPublicWithBooks,
)
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")],
    db: Session = Depends(get_db),
):
    bookshelf = db.get(Bookshelf, bookshelf_id)
    if not bookshelf:
        raise HTTPException(status_code=404, detail="Bookshelf not found")
    
    bookshelf_with_books = BookshelfPublicWithBooks.model_validate(bookshelf)
    bookshelf_with_books.books = [book.model_dump() for book in bookshelf_with_books.books]
    
    return bookshelf_with_books


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_bookshelf(bookshelf_create: BookshelfCreate, db: Session = Depends(get_db)):
    db_bookshelf = Bookshelf.model_validate(bookshelf_create)
    db.add(db_bookshelf)
    db.commit()
    return None


@router.patch("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to update")],
    bookshelf: BookshelfUpdate,
    db: Session = Depends(get_db),
):
    db_bookshelf = db.get(Bookshelf, bookshelf_id)
    if not db_bookshelf:
        raise HTTPException(status_code=404, detail="Bookshelf not found")
    bookshelf_data = bookshelf.model_dump(exclude_unset=True)
    db_bookshelf.sqlmodel_update(bookshelf_data)
    db.add(db_bookshelf)
    db.commit()
    return None


@router.delete("/{bookshelf_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to delete")],
    db: Session = Depends(get_db),
):
    bookshelf = db.get(Bookshelf, bookshelf_id)
    if not bookshelf:
        raise HTTPException(status_code=404, detail="Bookshelf not found")
    db.delete(bookshelf)
    db.commit()
    return None


@router.get(
    "/{bookshelf_id}/books/exclude/",
    status_code=status.HTTP_200_OK,
    response_model=list[BookPublic]
)
def get_books_not_on_bookshelf(
    bookshelf_id: Annotated[
        int,
        Path(
            title="The ID of the bookshelf for which we want to see books NOT on the shelf"
        ),
    ],
    db: Session = Depends(get_db),
):
    # Create a subquery to select book IDs that are in the bookshelf
    subquery = (
        select(BookBookshelfLink.book_id)
        .where(BookBookshelfLink.bookshelf_id == bookshelf_id)
        .distinct()
    )

    # Main query to select books not in the subquery results
    query = select(Book).where(Book.id.not_in(subquery))

    # Execute the query and fetch all results
    result = db.exec(query)
    books = result.fetchall()

    return [BookPublic.model_validate(book).model_dump() for book in books]


@router.post("/{bookshelf_id}/books/", status_code=status.HTTP_201_CREATED)
def add_book_to_bookshelf(
    bookshelf_id: Annotated[
        int, Path(title="The ID of the bookshelf to add a book to.")
    ],
    book_ids: BookIds,
    db: Session = Depends(get_db),
):
    # Fetch the bookshelf
    bookshelf = db.get(Bookshelf, bookshelf_id)
    if not bookshelf:
        raise HTTPException(status_code=404, detail="Bookshelf not found")

    # Fetch all the books
    books_to_add = []
    for book_id in book_ids.book_ids:
        book = db.get(Book, book_id)
        if not book:
            raise HTTPException(
                status_code=404, detail=f"Book with ID {book_id} not found"
            )

        books_to_add.append(book)

    # Add all the books to the bookshelf's books list
    bookshelf.books.extend(books_to_add)

    # Commit the changes
    db.commit()

    return None


@router.delete(
    "/{bookshelf_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_book_from_bookshelf(
    bookshelf_id: Annotated[
        int, Path(title="The ID of the bookshelf to delete a book from")
    ],
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db: Session = Depends(get_db),
):
    # Retrieve the Bookshelf instance
    bookshelf = db.get(Bookshelf, bookshelf_id)
    if not bookshelf:
        raise HTTPException(status_code=404, detail="Bookshelf not found")

    # Retrieve the Book instance to remove
    book_to_remove = db.get(Book, book_id)
    if not book_to_remove:
        raise HTTPException(status_code=404, detail="Book not found")

    # Remove the book from the bookshelf
    if book_to_remove in bookshelf.books:
        bookshelf.books.remove(book_to_remove)
        db.commit()

    return None
