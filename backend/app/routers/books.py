from fastapi import APIRouter, Depends, Path, status
from typing import Annotated
from app.models.book import Book, BookUpdate, Category
from app.services.openlibrary import OpenLibrary
from app.db.sqlite import get_db
import inspect
import urllib.request
import os

openlibrary = OpenLibrary()

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
def get_books(
    db = Depends(get_db)
):
    return db.execute('SELECT * FROM books').fetchall()

@router.get("/{book_id}", status_code=status.HTTP_200_OK)
def get_book(
    book_id: Annotated[int, Path(title="The ID of the book to get")],
    db = Depends(get_db)
):
    return db.execute(query='SELECT * FROM books WHERE id = ?', values=(book_id,)).fetchone()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_book(
    book: Book,
    db = Depends(get_db)
):
    search_results = await openlibrary.search(book=book)

    olid = openlibrary.find_olid(olid_response=search_results)

    if olid is None:
        
        filepath_for_db = '/assets/cover_images/No_Image_Available.jpg'

    else:
    
        cover_image = "https://covers.openlibrary.org/b/olid/{olid}-M.jpg".format(olid=olid)

        # Determine local filename for saving
        dirname = os.path.dirname(__file__)
        book_title_as_filename = "".join(c for c in book.title if c.isalpha() or c.isdigit() or c==' ').replace(' ', '_').rstrip()
        final_filename = os.path.join(dirname, '../../../frontend/public/assets/cover_images/' + book_title_as_filename + '.jpg')

        # Fetch and save file
        urllib.request.urlretrieve(cover_image, final_filename)
        
        filepath_for_db = '/assets/cover_images/' + book_title_as_filename + '.jpg'

    db.execute(query='INSERT INTO books (title, author, year, category, cover_image) VALUES (?, ?, ?, ?, ?)', values=(book.title, book.author, book.year, book.category, filepath_for_db))
    return None

@router.patch("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to update")],
    book: BookUpdate,
    db = Depends(get_db)
):
    update_fields = []
    parameters = []
    
    for attribute in BookUpdate.__fields__.keys():
        book_dict = book.__dict__
        if book_dict[attribute] is not None:
            update_fields.append(f"{attribute} = ?")
            parameters.append(book_dict[attribute])

    query = f"UPDATE books SET {', '.join(update_fields)} WHERE id = ?"
    parameters.append(book_id)
    db.execute(query=query, values=parameters)
    return None

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookshelf(
    book_id: Annotated[int, Path(title="The ID of the book to delete")],
    db = Depends(get_db)
):
    db.execute(query='DELETE FROM books WHERE id = ?', values=(book_id,))
    return None

@router.get("/categories/", status_code=status.HTTP_200_OK)
def get_book_categories():
    attributes = inspect.getmembers(Category, lambda a:not(inspect.isroutine(a)))
    return [a[1] for a in attributes if not(a[0].startswith('__') and a[0].endswith('__'))]
