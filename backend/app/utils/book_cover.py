from typing import Optional

from fastapi import HTTPException, UploadFile, status
import filetype
from nanoid import generate
from app.models.book import BookCreate, BookUpdate
from app.services.open_library.factory import get_open_library
from app.models.image import Image, ImageSource
from app.utils.images.factory import get_image_handler

ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/gif"}
MAX_ALLOWED_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
image_handler = get_image_handler()
open_library = get_open_library()

async def book_cover_handler(
  book_create_or_update: BookCreate | BookUpdate,
  file: Optional[UploadFile]
) -> Image | None:

  # We are creating a book with an Open Library ID for the book cover image
  if book_create_or_update.olid is not None:
      await open_library.fetch_image_from_olid(book_create_or_update.olid)
      image = Image(
          source=ImageSource.open_library,
          source_id=book_create_or_update.olid,
          extension=".jpg"
      )
      return image

  # We are creating a book with a directly uploaded book cover image
  if file:
      # Read file contents
      contents = await file.read()
      file_type = filetype.guess(contents)
      if file_type.mime not in ALLOWED_MIME_TYPES:
          raise HTTPException(
              status_code=status.HTTP_400_BAD_REQUEST,
              detail="Invalid file type. Only PNG, JPEG, and GIF files are allowed."
          )

      if len(contents) > MAX_ALLOWED_IMAGE_UPLOAD_SIZE:
          raise HTTPException(
              status_code=status.HTTP_400_BAD_REQUEST,
              detail="File size exceeded. Maximum allowed size is 5MB."
          )
      
      unique_id = generate(size=10)
      extension = f".{file_type.mime.split('/')[-1]}"

      image_handler.save_image(unique_id + extension, contents)

      image = Image(
          source=ImageSource.direct_upload,
          source_id=unique_id,
          extension=extension
      )
      return image

  return None