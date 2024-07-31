from typing import Annotated
from app.models.bookshelf import Bookshelf

from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/bookshelves")
def get_bookshelves():
    return {"get_bookshelves": "success"}

@app.post("/bookshelf")
def create_bookshelf(
    bookshelf: Bookshelf
):
    return {"create_bookshelf": "success"}

@app.get("/bookshelf/{bookshelf_id}")
def get_bookshelf(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")]
):
    return {"get_bookshelf " + str(bookshelf_id): "success"}

@app.get("/bookshelf/{bookshelf_id}/books")
def get_bookshelf_books(
    bookshelf_id: Annotated[int, Path(title="The ID of the bookshelf to get")]
):
    return {"get_bookshelf_books "  + str(bookshelf_id): "success"}
