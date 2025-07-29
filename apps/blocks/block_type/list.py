class ListBlock:
    type = 'list'
    schema = {
        'items': list,
        'type': str  # 'ordered' or 'unordered'
    }
    
    @classmethod
    def validate(cls, data):
        """Validate list block data"""
        if not isinstance(data.get('items'), list):
            raise ValueError("Items must be a list")
            
        list_type = data.get('type', 'unordered')
        if list_type not in ['ordered', 'unordered']:
            raise ValueError("List type must be 'ordered' or 'unordered'")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render list block as HTML"""
        items = data.get('items', [])
        list_type = data.get('type', 'unordered')
        
        tag = 'ol' if list_type == 'ordered' else 'ul'
        items_html = ''.join([f'<li>{item}</li>' for item in items])
        
        return f'<{tag}>{items_html}</{tag}>'