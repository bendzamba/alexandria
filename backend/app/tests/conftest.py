from app.models.book import Book
from typing import Any, Dict
import sys
import sqlite3


class DB:
    def __init__(self):
        self.connection = sqlite3.connect(":memory:", check_same_thread=False)
        self.connection.row_factory = sqlite3.Row
        self.cursor = self.connection.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON")
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS bookshelves (
                id INTEGER PRIMARY KEY, 
                title TEXT, 
                description TEXT
            )
        """
        )
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY, 
                title TEXT, 
                author TEXT, 
                year INTEGER, 
                cover_image TEXT
            )
        """
        )
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS bookshelves_books (
                bookshelf_id INTEGER,
                book_id INTEGER,
                PRIMARY KEY (bookshelf_id, book_id),
                FOREIGN KEY (bookshelf_id) REFERENCES bookshelves (id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
            )
        """
        )
        self.connection.commit()

    def execute(self, query: str, values: tuple = ()):
        self.cursor.execute(query, values)
        self.connection.commit()
        return self.cursor


db_instance = None


def get_db():
    global db_instance
    if db_instance is None:
        db_instance = DB()
    try:
        yield db_instance
    finally:
        pass


# Mock our system module so that downstream files that import app.db.sqlite will use our mock
module = type(sys)("app.db.sqlite")
module.get_db = get_db
sys.modules["app.db.sqlite"] = module


class OpenLibrary:
    def __init__(self):
        self.search_url = "https://openlibrary.org/search.json?title={title}"

    async def search(self, book: Book) -> Dict[str, Any]:
        return {}

    def find_olid(self, olid_response: Dict[str, Any]) -> str | None:
        return "12345"


module = type(sys)("app.services.openlibrary")
module.OpenLibrary = OpenLibrary
sys.modules["app.services.openlibrary"] = module
