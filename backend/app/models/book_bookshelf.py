from sqlmodel import Field, SQLModel


class BookBookshelfLink(SQLModel, table=True):
    book_id: int | None = Field(default=None, foreign_key="book.id", primary_key=True)
    bookshelf_id: int | None = Field(
        default=None, foreign_key="bookshelf.id", primary_key=True
    )
