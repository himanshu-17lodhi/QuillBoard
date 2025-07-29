from .base import BaseBlock

class TextBlock:
    type = 'text'
    schema = {
        'text': str,
        'formatting': list  # List of formatting objects (bold, italic, etc.)
    }
    
    @classmethod
    def validate(cls, data):
        """Validate text block data"""
        if not isinstance(data.get('text'), str):
            raise ValueError("Text must be a string")
        
        formatting = data.get('formatting', [])
        if not isinstance(formatting, list):
            raise ValueError("Formatting must be a list")
            
        for fmt in formatting:
            if not all(key in fmt for key in ['type', 'start', 'end']):
                raise ValueError("Invalid formatting object")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render text block as HTML"""
        text = data.get('text', '')
        formatting = data.get('formatting', [])
        
        # Sort formatting by start position
        formatting.sort(key=lambda x: x['start'])
        
        # Apply formatting
        html_parts = []
        last_pos = 0
        
        for fmt in formatting:
            # Add unformatted text before this format
            html_parts.append(text[last_pos:fmt['start']])
            
            # Add formatted text
            formatted_text = text[fmt['start']:fmt['end']]
            if fmt['type'] == 'bold':
                html_parts.append(f'<strong>{formatted_text}</strong>')
            elif fmt['type'] == 'italic':
                html_parts.append(f'<em>{formatted_text}</em>')
            elif fmt['type'] == 'underline':
                html_parts.append(f'<u>{formatted_text}</u>')
            elif fmt['type'] == 'code':
                html_parts.append(f'<code>{formatted_text}</code>')
            elif fmt['type'] == 'link':
                url = fmt.get('url', '#')
                html_parts.append(f'<a href="{url}">{formatted_text}</a>')
            
            last_pos = fmt['end']
        
        # Add remaining unformatted text
        html_parts.append(text[last_pos:])
        
        return f'<p>{"".join(html_parts)}</p>'