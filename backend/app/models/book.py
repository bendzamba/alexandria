from pydantic import BaseModel, create_model
from typing import Optional

class Book(BaseModel):
    title: str
    author: str
    year: int
    olid: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None

class BookIds(BaseModel):
    book_ids: list[int]

BookUpdate = create_model(
    'BookUpdate',
    **{field: (Optional[type_hint], None) for field, type_hint in Book.__annotations__.items()}
)