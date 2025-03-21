import urllib
import os

from app.utils.images.base import BaseImageHandler

class LocalImageHandler(BaseImageHandler):
    def __init__(self, local_directory, api_url, image_mount_path):
        super().__init__()
        self.local_directory = local_directory
        self.api_url = api_url
        self.image_mount_path = image_mount_path

    def download_image(self, url, image_name):
        file_path = os.path.join(self.local_directory, image_name)
        urllib.request.urlretrieve(url, file_path)
        return file_path

    def save_image(self, image_name, image_content):
        # No action needed locally, image already saved by `download_image`
        # TODO if directly uploading an image, we have not 'downloaded' the image
        # TODO and thus we need to handle the saving
        pass

    def get_image_uri(self, key):
        return os.path.join(self.api_url, self.image_mount_path, key)
