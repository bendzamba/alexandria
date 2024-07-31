from pydantic import BaseModel

class Bookshelf(BaseModel):
    title: str
    description: str