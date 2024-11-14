from enum import Enum
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel
from app.models.book import Book
from app.utils.images.factory import get_image_handler

image_handler = get_image_handler()

class ImageSource(str,Enum):
  open_library = "open_library"
  direct_upload = "direct_upload"


class ImageBase(SQLModel):
  source: ImageSource
  # Source ID will either be an OLID for Open Library or a NanoID for direct upload
  source_id: str
  extension: str


class Image(ImageBase, table=True):
  id: int = Field(default=None, primary_key=True)
  book_id: int = Field(foreign_key="book.id", unique=True)

  book: "Book" = Relationship(back_populates="image")


class ImagePublic(ImageBase):
  id: int
  uri: Optional[str] = None
  
  def model_dump(self, **kwargs):
    # Start by calling the default model_dump() to get the serialized data
    data = super().model_dump(**kwargs)
    
    # Set `uri` based on `source_id` and `extension`, if not already set
    if self.source_id and self.extension:
        data["uri"] = image_handler.get_image_uri(self.source_id + self.extension)
    
    return data