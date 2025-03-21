import base64
import json
import os
import logging

from fastapi import FastAPI, Request
from starlette.datastructures import UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
from app.routers import books, bookshelves
from sqlmodel import SQLModel, text
from app.db.sqlite import get_engine
from dotenv import load_dotenv
from mangum import Mangum

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
            json_data = {}
            for key, value in form_data.items():
                if isinstance(value, UploadFile):
                    json_data[key] = base64.b64encode(await value.read()).decode("utf-8")
                else:
                    json_data[key] = value
            # Convert JSON data to bytes and set as the new request body
            json_body = json.dumps(json_data).encode("utf-8")
            # Update the request scope
            request.scope["headers"] = [
                (b"content-type", b"application/json"),
                *(header for header in request.scope["headers"] if header[0] != b"content-type"),
            ]
            request._body = json_body  # Set the new body directly

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
