from app.models.book_bookshelf import BookBookshelfLink
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from enum import Enum

if TYPE_CHECKING:
    from app.models.bookshelf import Bookshelf  # Only imported when type checking

class ReadStatus(str,Enum):
    not_read = "not_read"
    read = "read"
    reading = "reading"


class BookBase(SQLModel):
    title: str
    author: str
    year: int
    # Instead of creating a new table to host unused OLIDs per book
    # we store the full bore of them as a json-encoded list
    olids: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    read_status: ReadStatus
    read_start_date: Optional[str] = None
    read_end_date: Optional[str] = None


class Book(BookBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bookshelves: List["Bookshelf"] = Relationship(
        back_populates="books",
        link_model=BookBookshelfLink,
        sa_relationship_kwargs=dict(lazy="selectin"),
    )
    image: "Image" = Relationship(
        back_populates="book",
        cascade_delete=True,
        # sa_relationship_kwargs=dict(lazy="selectin"), 
    )


class BookCreate(BookBase):
    olid: Optional[str] = None


class BookPublic(BookBase):
    id: int
    image: Optional["ImagePublic"] = None

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)

        # Ensure image gets its own `model_dump` call if it's not None
        if self.image is not None:
            data["image"] = self.image.model_dump()
        
        return data


class BookUpdate(SQLModel):
    title: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    # olid: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    read_status: Optional[ReadStatus] = None
    read_start_date: Optional[str] = None
    read_end_date: Optional[str] = None
    olid: Optional[str] = None


class BookPublicWithBookshelves(BookPublic):
    bookshelves: List["BookshelfPublic"] = []


# `noqa` is used to suppress linter errors
# we needed the import here to avoid circular imports
from app.models.image import Image, ImagePublic # noqa
from app.models.bookshelf import BookshelfPublic  # noqa

BookPublic.model_rebuild()
BookPublicWithBookshelves.model_rebuild()

class BookIds(SQLModel):
    book_ids: List[int]
