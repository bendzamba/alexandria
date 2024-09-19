import os

class BaseImageHandler:
    def __init__(self):
        self.storage_backend = os.getenv('STORAGE_BACKEND', 'local')
    
    def download_image(self, url, image_name):
        """To be implemented by subclass."""
        raise NotImplementedError("This method should be implemented by subclasses.")
    
    def save_image(self, image_name, image_content):
        """To be implemented by subclass."""
        raise NotImplementedError("This method should be implemented by subclasses.")
    
    def get_image_uri(self, olid):
        """To be implemented by subclass."""
        raise NotImplementedError("This method should be implemented by subclasses.")