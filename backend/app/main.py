from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import books, bookshelves
from sqlmodel import SQLModel, text
from app.db.sqlite import DB
from dotenv import load_dotenv
import os

# These are only imported for the create_all call
# `noqa: F401` is used to suppress linter errors
from app.models.book import Book  # noqa: F401
from app.models.bookshelf import Bookshelf  # noqa: F401
from app.models.book_bookshelf import BookBookshelfLink  # noqa: F401

# Load environment variables from a .env file
load_dotenv()

db = DB()
engine = db.get_engine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))  # for SQLite only
    yield


app = FastAPI(lifespan=lifespan)

app.mount("/images", StaticFiles(directory=os.getenv("IMAGES_DIRECTORY")), name="images")

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
