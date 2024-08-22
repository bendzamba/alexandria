from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from app.models.book_bookshelf import BookBookshelfLink

if TYPE_CHECKING:
    from app.models.bookshelf import Bookshelf  # Only imported when type checking

class BookBase(SQLModel):
    title: str
    author: str
    year: int
    olid: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None  

class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cover_uri: str
    bookshelves: List["Bookshelf"] = Relationship(back_populates="books", link_model=BookBookshelfLink, sa_relationship_kwargs=dict(lazy="selectin"))
  
class BookCreate(BookBase):
    pass

class BookPublic(BookBase):
    id: int
    cover_uri: str

class BookUpdate(SQLModel):
    title: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    olid: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None

class BookPublicWithBookshelves(BookPublic):
    bookshelves: List["BookshelfPublic"] = []

from app.models.bookshelf import BookshelfPublic
BookPublicWithBookshelves.model_rebuild()

class BookIds(SQLModel):
    book_ids: List[int]

