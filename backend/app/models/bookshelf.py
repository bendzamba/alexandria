from app.models.book_bookshelf import BookBookshelfLink
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from enum import Enum

if TYPE_CHECKING:
    from app.models.book import Book, BookPublic  # Only imported when type checking


# These are a subset of sortable columns from our Book model
class SortKey(str,Enum):
    id = "id"
    title = "title"
    author = "author"
    year = "year"
    rating = "rating"


class SortDirection(str,Enum):
    ascending = "ascending"
    descending = "descending"


class BookshelfBase(SQLModel):
    title: str
    description: str
    sort_key: SortKey
    sort_direction: SortDirection


class Bookshelf(BookshelfBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    books: List["Book"] = Relationship(
        back_populates="bookshelves",
        link_model=BookBookshelfLink,
        sa_relationship_kwargs=dict(lazy="selectin"),
    )


class BookshelfCreate(BookshelfBase):
    pass


class BookshelfPublic(BookshelfBase):
    id: int


class BookshelfUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sort_key: Optional[SortKey] = None
    sort_direction: Optional[SortDirection] = None


class BookshelfPublicWithBooks(BookshelfPublic):
    books: list["BookPublic"] = []


# `noqa` is used to suppress linter errors
# we needed the import here to avoid circular imports
from app.models.book import BookPublic  # noqa

BookshelfPublicWithBooks.model_rebuild()
