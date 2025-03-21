from abc import ABC, abstractmethod

from app.models.openlibrary import Works
from app.models.exception import ExceptionHandler

class BaseOpenLibraryHandler(ABC):

  @abstractmethod
  async def search_by_title(self, title: str) -> Works | ExceptionHandler:
    """To be implemented by subclass."""
    pass

  @abstractmethod
  async def fetch_image_from_olid(self, olid: str) -> str:
    """To be implemented by subclass."""
    pass