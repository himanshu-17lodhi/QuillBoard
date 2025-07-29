from PIL import Image
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import os
import magic
import mimetypes
from io import BytesIO

class MediaProcessor:
    IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'}
    VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.wmv'}
    AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a'}

    def __init__(self, file):
        self.file = file
        self.mime = magic.Magic(mime=True)

    def process(self):
        """Process the uploaded file and return processed file and thumbnail"""
        result = {'file': self.file}
        
        # Generate thumbnail for images
        if self.is_image():
            thumbnail = self.generate_thumbnail()
            if thumbnail:
                result['thumbnail'] = thumbnail
        
        return result

    def generate_thumbnail(self, size=(200, 200)):
        """Generate thumbnail for image files"""
        if not self.is_image():
            return None

        try:
            image = Image.open(self.file)
            image.thumbnail(size)
            
            thumb_io = BytesIO()
            image.save(thumb_io, format=image.format)
            
            temp_thumb = NamedTemporaryFile(delete=False)
            temp_thumb.write(thumb_io.getvalue())
            temp_thumb.flush()
            
            return File(temp_thumb)
        except Exception:
            return None

    def is_image(self):
        """Check if file is an image"""
        return self.get_extension().lower() in self.IMAGE_EXTENSIONS

    def get_file_type(self):
        """Determine file type based on extension"""
        ext = self.get_extension().lower()
        
        if ext in self.IMAGE_EXTENSIONS:
            return 'image'
        elif ext in self.DOCUMENT_EXTENSIONS:
            return 'document'
        elif ext in self.VIDEO_EXTENSIONS:
            return 'video'
        elif ext in self.AUDIO_EXTENSIONS:
            return 'audio'
        return 'other'

    def get_extension(self):
        """Get file extension"""
        return os.path.splitext(self.file.name)[1]

    def get_mime_type(self):
        """Get MIME type of file"""
        try:
            return self.mime.from_buffer(self.file.read(1024))
        except Exception:
            return mimetypes.guess_type(self.file.name)[0]