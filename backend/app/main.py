from fastapi import FastAPI, Path
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import books, bookshelves
import sqlite3

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix="/books", tags=["books"])
app.include_router(bookshelves.router, prefix="/bookshelves", tags=["bookshelves"])

@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = sqlite3.connect('bookshelf.db', check_same_thread=False)
    cursor = connection.cursor()
    # self.cursor.execute('''DROP TABLE IF EXISTS bookshelves''')
    # self.cursor.execute('''DROP TABLE IF EXISTS books''')
    # self.cursor.execute('''DROP TABLE IF EXISTS bookshelves_books''')
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookshelves (
            id INTEGER PRIMARY KEY, 
            title TEXT, 
            description TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY, 
            title TEXT, 
            author TEXT, 
            year INTEGER, 
            olid TEXT,
            cover_uri TEXT,
            rating INTEGER
            review TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookshelves_books (
            bookshelf_id INTEGER,
            book_id INTEGER,
            PRIMARY KEY (bookshelf_id, book_id),
            FOREIGN KEY (bookshelf_id) REFERENCES bookshelves (id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
        )
    ''')
    connection.commit()