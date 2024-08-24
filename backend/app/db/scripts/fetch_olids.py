from app.services.openlibrary import OpenLibrary
from sqlmodel import Session, select, create_engine
from app.models.book import Book
import asyncio
import json

# From root directory `backend`, run python3 -m app.db.scripts.fetch_olids

sqlite_file_name = "bookshelf.db"
sqlite_url = f"sqlite:///app/{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

ol = OpenLibrary()


async def fetch_titles_that_are_missing_olids():
    books_without_olids = []

    with Session(engine) as session:
        books = session.exec(select(Book).where(Book.olids is None)).all()
        for book in books:
            books_without_olids.append(book.title)

    return books_without_olids


async def get_olids_by_title(title):
    search_results = await ol.search_by_title(title)
    return search_results.model_dump()[0]["olids"]


async def update_book_by_title(title, olids):
    with Session(engine) as session:
        db_book = session.exec(select(Book).where(Book.title == title)).first()
        db_book.sqlmodel_update({"olids": json.dumps(olids)})
        session.add(db_book)
        session.commit()


titles = asyncio.run(fetch_titles_that_are_missing_olids())

# Change this to run as many as needed, or loop through all
for index in range(0, 1):
    olids = asyncio.run(get_olids_by_title(titles[index]))
    asyncio.run(update_book_by_title(titles[index], olids))
