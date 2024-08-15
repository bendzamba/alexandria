import os
import urllib

class Image:

    def __init__(self):

        self.local_image_directory = '/assets/cover_images/'
        self.default_cover_image = 'No_Image_Available.jpg'
        self.relative_path_to_file = '../../../frontend/public/assets/cover_images/{filename}.jpg'

    def sanitize_book_title_for_filename(self, book_title: str) -> str:

        return "".join(c for c in book_title if c.isalpha() or c.isdigit() or c==' ').replace(' ', '_').rstrip()

    def determine_local_file_destination(self, filename: str) -> str:

        # Determine directory of our file
        current_directory = os.path.dirname(__file__)

        # Assemble final local file destination
        return os.path.join(current_directory, self.relative_path_to_file.format(filename=filename))
        
    def download(self, remote_url: str, local_filename: str) -> None:

        return urllib.request.urlretrieve(remote_url, local_filename)
    
    def get_local_image_directory(self) -> str:

        return self.local_image_directory
    
    def get_default_cover_with_path_for_database(self) -> str:

        return self.local_image_directory + self.default_cover_image
    
    def get_cover_with_path_for_database(self, filename: str) -> str:

        return self.local_image_directory + filename
