class HeadingBlock:
    type = 'heading'
    schema = {
        'text': str,
        'level': int  # 1-6 for h1-h6
    }
    
    @classmethod
    def validate(cls, data):
        """Validate heading block data"""
        if not isinstance(data.get('text'), str):
            raise ValueError("Heading text must be a string")
            
        level = data.get('level', 1)
        if not isinstance(level, int) or level < 1 or level > 6:
            raise ValueError("Heading level must be between 1 and 6")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render heading block as HTML"""
        text = data.get('text', '')
        level = data.get('level', 1)
        return f'<h{level}>{text}</h{level}>'