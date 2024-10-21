import os
from abc import ABC, abstractmethod

class BaseImageHandler(ABC):
    
    def __init__(self):
        self.storage_backend = os.getenv('STORAGE_BACKEND', 'local')
    
    @abstractmethod
    def download_image(self, url, image_name):
        """To be implemented by subclass."""
        pass
    
    @abstractmethod
    def save_image(self, image_name, image_content):
        """To be implemented by subclass."""
        pass

    @abstractmethod
    def get_image_uri(self, olid):
        """To be implemented by subclass."""
        pass