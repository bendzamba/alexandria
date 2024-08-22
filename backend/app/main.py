from fastapi import FastAPI, Path
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import books, bookshelves
from sqlmodel import SQLModel, text
from app.db.sqlite import DB

 # These are only imported for the create_all call
from app.models.book import Book
from app.models.bookshelf import Bookshelf
from app.models.book_bookshelf import BookBookshelfLink

db = DB()
engine = db.get_engine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))  # for SQLite only
    yield


app = FastAPI(lifespan=lifespan)

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
