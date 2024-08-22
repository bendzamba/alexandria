from sqlmodel import SQLModel, Field, Relationship
from pydantic import create_model
from typing import Optional, TYPE_CHECKING, List
from app.models.book_bookshelf import BookBookshelfLink

if TYPE_CHECKING:
    from app.models.book import Book, BookPublic  # Only imported when type checking

class BookshelfBase(SQLModel):
    title: str
    description: str

class Bookshelf(BookshelfBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    books: List["Book"] = Relationship(back_populates="bookshelves", link_model=BookBookshelfLink, sa_relationship_kwargs=dict(lazy="selectin"))

class BookshelfCreate(BookshelfBase):
    pass

class BookshelfPublic(BookshelfBase):
    id: int

class BookshelfUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None

class BookshelfPublicWithBooks(BookshelfPublic):
    books: list["BookPublic"] = []

from app.models.book import BookPublic
BookshelfPublicWithBooks.model_rebuild()