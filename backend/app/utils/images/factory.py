import os

from app.utils.images.local import LocalImageHandler
from app.utils.images.s3 import S3ImageHandler

def get_image_handler():
    storage_backend = os.getenv('STORAGE_BACKEND', 'local')
    
    if storage_backend == 'local':
        return LocalImageHandler(
            local_directory=os.getenv("LOCAL_IMAGE_DIRECTORY"),
            api_url=os.getenv("API_URL"),
            image_mount_path=os.getenv("API_IMAGE_MOUNT_PATH")
          )
    elif storage_backend == 's3':
        return S3ImageHandler(
            bucket_name=os.getenv("S3_IMAGE_BUCKET"),
            tmp_directory=os.getenv("LOCAL_IMAGE_DIRECTORY")
        )
    else:
        raise ValueError(f"Unknown STORAGE_BACKEND: {storage_backend}")
