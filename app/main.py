from typing import Annotated
from app.models.bookshelf import Bookshelf
from app.models.book import Book
from app.services.openlibrary import OpenLibrary
from fastapi import FastAPI, Path
import json

openlibrary = OpenLibrary()

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

@app.get("/books")
def get_books():
    books = []
    with open("db/books.txt", "r") as myfile:
        for line in myfile:
            books.append(json.loads(line))
    return books

@app.get("/book/{book_id}")
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")]
):
    return {"get_book " + str(book_id): "success"}

@app.post("/book")
async def create_book(
    book: Book
):
    search_results = await openlibrary.search(book=book)

    olid = openlibrary.find_olid(olid_response=search_results)

    if olid is None:
        return {"No cover found"}
    
    cover = "https://covers.openlibrary.org/b/olid/{olid}-M.jpg".format(olid=olid)
    
    with open("db/books.txt", "a") as myfile:
        myfile.write(json.dumps(
            {
                'title': book.title,
                'author': book.author,
                'year': book.year,
                'category': book.category,
                'cover': cover
            }
        ))
        myfile.write('\n')
        myfile.flush()

    return {"Success"}