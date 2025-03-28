import base64
from fastapi import HTTPException, status
import filetype
from nanoid import generate
from app.models.book import BookCreate, BookUpdate
from app.services.open_library.factory import get_open_library
from app.models.image import Image, ImageSource
from app.utils.images.factory import get_image_handler

# TODO expand this?
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/gif"}
MAX_ALLOWED_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
image_handler = get_image_handler()
open_library = get_open_library()


async def handle_olid(olid: str, open_library) -> Image:
    await open_library.fetch_image_from_olid(olid)
    image = Image(
        source=ImageSource.open_library,
        source_id=olid,
        extension=".jpg"
    )
    return image


async def handle_file_upload(file, allowed_mimes, max_size, unique_id, image_handler):
    # We are creating a book with a directly uploaded book cover image
    contents = base64.b64decode(file)
    # Attempt to determine the file type from headers
    file_type = filetype.guess(contents)

    if file_type.mime not in allowed_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PNG, JPEG, and GIF files are allowed."
        )

    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeded. Maximum allowed size is 5MB."
        )
    
    extension = f".{file_type.mime.split('/')[-1]}"

    image_handler.save_image(unique_id + extension, contents)

    image = Image(
        source=ImageSource.direct_upload,
        source_id=unique_id,
        extension=extension
    )
    return image


async def book_cover_handler(
  book_create_or_update: BookCreate | BookUpdate
) -> Image | None:
    
    if (olid := book_create_or_update.olid) is not None:
        # We are creating a book with an Open Library ID for the book cover image
        return await handle_olid(olid=olid, open_library=open_library)

    if (file := book_create_or_update.file) is not None:
        # Since we do not have an OLID, we generate a unique alphanumeric ID
        unique_id = generate(size=10)
        return await handle_file_upload(
            file=file,
            allowed_mimes=ALLOWED_MIME_TYPES,
            max_size=MAX_ALLOWED_IMAGE_UPLOAD_SIZE,
            unique_id=unique_id,
            image_handler=image_handler
        )

    return None


def get_book_cover_handler():
    yield book_cover_handler