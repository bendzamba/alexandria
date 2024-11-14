import urllib
import os
import boto3

from app.utils.images.base import BaseImageHandler

class S3ImageHandler(BaseImageHandler):
    def __init__(self, bucket_name, tmp_directory):
        super().__init__()
        self.s3 = boto3.client('s3', region_name='us-east-1')
        self.bucket_name = bucket_name
        self.tmp_directory = tmp_directory

    def download_image(self, url, image_name):
        tmp_file_path = os.path.join(self.tmp_directory, image_name)
        urllib.request.urlretrieve(url, tmp_file_path)
        return tmp_file_path

    def save_image(self, image_name, image_content):
        self.s3.put_object(Bucket=self.bucket_name, Key=image_name, Body=image_content)
        # TODO - do we want to delete the local tmp image here?

    def get_image_uri(self, key):
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket_name, 'Key': key},
            ExpiresIn=3600
        )