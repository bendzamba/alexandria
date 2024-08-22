import httpx
from typing import Any, Dict
from app.models.openlibrary import Work
from pydantic import ValidationError
from app.utils.image import Image
import os

class OpenLibrary:

    def __init__(self):
        self.search_title_url = "https://openlibrary.org/search.json?title={title}"
        # TODO the below limiting/filtering is not yet implemented!
        # We don't currently need all fields returned
        # We only include title so we have a nice response format to unpack without dealing with the supplied title
        self.search_fields_key = 'fields'
        # taken from Work keys: 'title', 'author_name', 'cover_edition_key', 'edition_key', 'first_publish_year'
        self.search_fields_values = Work.__dict__.keys()
        self.search_fields_separator = ','
        # We currently on;y need one result, as the default sort is 'relevance'
        self.search_limit_key = 'limit'
        self.search_limit_value = '1'
        # For fetching cover images. Size options are S, M, L (small, medium, large)
        self.cover_image_url = "https://covers.openlibrary.org/b/olid/{olid}-{size}.jpg"
        self.cover_image_size = "L"

        # Use Image utility to help with image fetching and determining cover URI
        self.image = Image()
        self.cover_uri = ""

    async def search_by_title(self, title: str) -> Dict[str, Any]:

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.search_title_url.format(title=title), timeout=10.0)
                response.raise_for_status()
            except Exception as e:
                print("Exception occurred", e)
                return None
            
            try:
                response_json = response.json()

                if len(response_json['docs']) == 0:
                    return False

                return Work(**response_json['docs'][0])
            
            except ValidationError as e:
                print("Validation error occurred:", e)
                return None
        
    def find_olid(self, olid_response: Dict[str, Any]) -> str | None:

        olid = None

        if olid_response['numFound'] > 0:
            for doc in olid_response['docs']:
                if 'cover_edition_key' in doc:
                    # Select the first cover edition key found
                    olid = doc['cover_edition_key']
                    break

        return olid
    
    def build_image_url_from_olid(self, olid: str):

        return self.cover_image_url.format(olid=olid, size=self.cover_image_size)
    
    async def fetch_image_from_olid(self, olid: str):

        if olid is None:
            self.cover_uri = self.image.default_cover_image
        else:
            # URL where we can find the cover image we want using OLID
            open_library_url = self.build_image_url_from_olid(olid=olid)
            # Local file destination where we want to store the image
            local_file_destination = self.image.determine_local_file_destination(filename=olid)

            if os.path.isfile(local_file_destination) == False:
                # Download remote to local only if we don't already have the file
                await self.image.download(remote_url=open_library_url, local_filename=local_file_destination)

            # Get path for database, which can be different from full local file destination, such as 
            # serving the image from a relative directory from the frontend application
            self.cover_uri = self.image.get_cover_with_path_for_database(filename=olid)

    def get_cover_uri(self):

        return self.cover_uri