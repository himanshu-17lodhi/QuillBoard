from django.core.files.storage import Storage, FileSystemStorage
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
import os

class MediaStorage:
    @staticmethod
    def get_storage():
        storage_backend = getattr(settings, 'MEDIA_STORAGE_BACKEND', 'local')
        
        if storage_backend == 's3':
            return S3MediaStorage()
        else:
            return LocalMediaStorage()

class LocalMediaStorage(FileSystemStorage):
    def __init__(self):
        super().__init__(
            location=settings.MEDIA_ROOT,
            base_url=settings.MEDIA_URL
        )

class S3MediaStorage(S3Boto3Storage):
    def __init__(self):
        super().__init__(
            access_key=settings.AWS_ACCESS_KEY_ID,
            secret_key=settings.AWS_SECRET_ACCESS_KEY,
            bucket_name=settings.AWS_STORAGE_BUCKET_NAME,
            region_name=settings.AWS_S3_REGION_NAME,
            custom_domain=settings.AWS_S3_CUSTOM_DOMAIN,
            file_overwrite=False
        )