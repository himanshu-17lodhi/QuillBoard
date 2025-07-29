from django.conf import settings
import os

class ImageBlock:
    type = 'image'
    schema = {
        'url': str,
        'caption': str,
        'alt': str,
        'size': dict  # {width: int, height: int}
    }
    
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    
    @classmethod
    def validate(cls, data):
        """Validate image block data"""
        url = data.get('url', '')
        if not url:
            raise ValueError("Image URL is required")
            
        # Validate file extension
        _, ext = os.path.splitext(url.lower())
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise ValueError("Invalid image file type")
            
        # Validate size if provided
        size = data.get('size', {})
        if size:
            width = size.get('width', 0)
            height = size.get('height', 0)
            if not isinstance(width, int) or not isinstance(height, int):
                raise ValueError("Image dimensions must be integers")
            if width <= 0 or height <= 0:
                raise ValueError("Image dimensions must be positive")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render image block as HTML"""
        url = data.get('url', '')
        caption = data.get('caption', '')
        alt = data.get('alt', caption)
        size = data.get('size', {})
        
        style = ''
        if size:
            width = size.get('width', '')
            height = size.get('height', '')
            if width and height:
                style = f'width: {width}px; height: {height}px;'
        
        img_html = f'<img src="{url}" alt="{alt}" style="{style}" class="max-w-full h-auto">'
        if caption:
            return f'<figure>{img_html}<figcaption class="text-center text-gray-600 mt-2">{caption}</figcaption></figure>'
        return img_html