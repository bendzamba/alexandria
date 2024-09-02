import os
import urllib
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()


class Image:
    def __init__(self):
        self.local_image_directory = os.getenv("IMAGES_DIRECTORY")
        self.default_cover_image = "No_Image_Available.jpg"
        self.relative_path_to_file = (
            os.getenv("IMAGES_DIRECTORY") + "{filename}{extension}"
        )
        self.image_file_extension = ".jpg"

    def sanitize_book_title_for_filename(self, book_title: str) -> str:
        return (
            "".join(c for c in book_title if c.isalpha() or c.isdigit() or c == " ")
            .replace(" ", "_")
            .rstrip()
        )

    def determine_local_file_destination(self, filename: str) -> str:

        # Assemble final local file destination
        return self.relative_path_to_file.format(
            filename=filename, extension=self.image_file_extension
        )

    async def download(self, remote_url: str, local_filename: str) -> None:
        return urllib.request.urlretrieve(remote_url, local_filename)

    def get_local_image_directory(self) -> str:
        return self.local_image_directory

    def get_default_cover_with_path_for_database(self) -> str:
        return self.local_image_directory + self.default_cover_image

    def get_cover_with_path_for_database(self, filename: str) -> str:
        return self.local_image_directory + filename + self.image_file_extension
