import httpx
from pydantic import ValidationError
import urllib
from app.services.open_library.base import BaseOpenLibraryHandler
from app.models.openlibrary import Work, Works
from app.models.exception import ExceptionHandler
from app.utils.images.factory import get_image_handler


class LocalOpenLibraryHandler(BaseOpenLibraryHandler):

  def __init__(self):
    self.search_title_url = "https://openlibrary.org/search.json?title={title}&"
    self.search_timeout = 10 # seconds

    # We don't currently need all fields returned
    # We only include title so we have a nice response format to unpack without dealing with the supplied title
    self.search_fields_key = "fields"
    self.search_fields_values = Work.__annotations__.keys()
    self.search_fields_separator = ","

    # For fetching cover images. Size options are S, M, L (small, medium, large)
    self.cover_image_url = "https://covers.openlibrary.org/b/olid/{olid}-{size}.{extension}"
    self.cover_image_size = "L"
    self.cover_image_extension = "jpg"

    # Use Image utility to help with image fetching and determining cover URI
    self.image_handler = get_image_handler()

  async def search_by_title(self, title: str) -> Works | ExceptionHandler:
    async with httpx.AsyncClient() as client:
      try:
        url = self._build_search_url(title=title)
        response = await client.get(url, timeout=self.search_timeout)
        response.raise_for_status()
      except httpx.TimeoutException:
        return ExceptionHandler(status_code=ExceptionHandler.get_timeout_status_code(), message=f"Open Library's API has timed out after {self.search_timeout} seconds.")
      except Exception as e:
        return ExceptionHandler(status_code=ExceptionHandler.get_timeout_status_code(), message=str(e))

      try:
        response_json = response.json()

        if "docs" not in response_json or len(response_json["docs"]) == 0:

          return ExceptionHandler(status_code=ExceptionHandler.get_no_results_status_code(), message="No results found. Please try a different search.")

        works = []
        for doc in response_json["docs"]:
          try:
            Work.model_validate(doc)
            works.append(Work(**doc))
          except ValidationError as exc:
            print(repr(exc.errors()[0]["type"]))

          return Works(**{"works": works})

      except Exception as e:
        return ExceptionHandler(status_code=ExceptionHandler.get_no_results_status_code(), message=str(e))

  async def fetch_image_from_olid(self, olid: str | None) -> str:
      if olid is None:
          return

      # URL where we can find the cover image we want using OLID
      open_library_url = self._build_image_url_from_olid(olid=olid)

      # Download image from Open Library
      image_path = self.image_handler.download_image(open_library_url, olid + "." + self.cover_image_extension)

      # Read image contents to bytes
      with open(image_path, "rb") as image_file:
          image_content = image_file.read()

      # Store the image in its final location
      self.image_handler.save_image(olid + "." + self.cover_image_extension, image_content)
      
  def _build_search_url(self, title) -> str:
      params = {
          self.search_fields_key: self.search_fields_separator.join(
              self.search_fields_values
          )
      }
      encoded_title = urllib.parse.quote(title)
      return self.search_title_url.format(title=encoded_title) + urllib.parse.urlencode(
          params
      )

  def _build_image_url_from_olid(self, olid: str) -> str:
      return self.cover_image_url.format(olid=olid, size=self.cover_image_size, extension=self.cover_image_extension)
  