from pydantic import BaseModel, create_model
from typing import Optional

class Bookshelf(BaseModel):
    title: str
    description: str

BookshelfUpdate = create_model(
    'BookshelfUpdate',
    **{field: (Optional[type_hint], None) for field, type_hint in Bookshelf.__annotations__.items()}
)