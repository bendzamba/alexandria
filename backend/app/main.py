from fastapi import FastAPI, Request, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from app.routers import books, bookshelves
from sqlmodel import SQLModel, text
from app.db.sqlite import get_engine
from dotenv import load_dotenv
from mangum import Mangum
import os
import logging

# These are only imported for the create_all call
# `noqa: F401` is used to suppress linter errors
from app.models.book import Book  # noqa: F401
from app.models.bookshelf import Bookshelf  # noqa: F401
from app.models.book_bookshelf import BookBookshelfLink  # noqa: F401

logging.disable(logging.INFO)

# Load environment variables from a .env file
load_dotenv()

engine = get_engine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))  # for SQLite only
    yield


# Normalize all incoming data to JSON so as not to burden our routes with
# validating and handling multiple content types
# This comes into play when the client sends Form Data along with a file upload
class FormToJSONMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_type = request.headers.get("Content-Type", "").split(";", 1)[0]
        if content_type == "multipart/form-data":
            form_data = await request.form()
            # This can include a File of type UploadFile
            json_data = None
            for key, value in form_data.items():
                if isinstance(value, UploadFile):
                    json_data[key] = await value.read()
                else:
                    json_data[key] = value
            request.headers.__delitem__("content-type")
            request.headers["Content-Type"] = "application/json"
            request._json = json_data
        return await call_next(request)


app = FastAPI(lifespan=lifespan)

if os.getenv("STORAGE_BACKEND") == "local":
    app.mount("/images", StaticFiles(directory=os.getenv("LOCAL_IMAGE_DIRECTORY")), name="images")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(FormToJSONMiddleware)

app.include_router(books.router, prefix="/books", tags=["books"])
app.include_router(bookshelves.router, prefix="/bookshelves", tags=["bookshelves"])

# For Lambda. Ignored otherwise.
handler = Mangum(app)
