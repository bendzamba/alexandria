from fastapi import APIRouter, Depends, Path, status
from typing import Annotated
from app.models.book import Book, BookUpdate
from app.models.openlibrary import Work
from app.services.openlibrary import OpenLibrary
from app.db.sqlite import get_db
from app.utils.image import Image
import inspect
import os.path

openlibrary = OpenLibrary()
image = Image()

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

    if book.olid is None:
        
        filepath_for_db = image.default_cover_image

    else:
    
        cover_image = openlibrary.build_image_url_from_olid(olid=book.olid)

        local_file_destination = image.determine_local_file_destination(filename=book.olid)

        await image.download(remote_url=cover_image, local_filename=local_file_destination)
        
        filepath_for_db = image.get_cover_with_path_for_database(filename=book.olid)

    db.execute(query='INSERT INTO books (title, author, year, olid, cover_uri) VALUES (?, ?, ?, ?, ?)', values=(book.title, book.author, book.year, book.olid, filepath_for_db))
    return None

@router.patch("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_bookshelf(
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

    if book.olid is not None:
    
        local_file_destination = image.determine_local_file_destination(filename=book.olid)

        if os.path.isfile(local_file_destination) == False:

            cover_image = openlibrary.build_image_url_from_olid(olid=book.olid)

            await image.download(remote_url=cover_image, local_filename=local_file_destination)
        
            filepath_for_db = image.get_cover_with_path_for_database(filename=book.olid)

            update_fields.append(f"cover_uri = ?")
            parameters.append(filepath_for_db)

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

@router.get("/search/{title}", status_code=status.HTTP_200_OK)
async def search_by_title(
    title: Annotated[str, Path(title="The title we are searching for")]
):
    search_results: Work = await openlibrary.search_by_title(title=title)

    if not search_results:
        return {}

    return search_results.model_dump()