class TableBlock:
    type = 'table'
    schema = {
        'rows': list,
        'headers': list,
        'columnCount': int
    }
    
    @classmethod
    def validate(cls, data):
        """Validate table block data"""
        if not isinstance(data.get('rows'), list):
            raise ValueError("Rows must be a list")
            
        if not isinstance(data.get('headers'), list):
            raise ValueError("Headers must be a list")
            
        column_count = data.get('columnCount', len(data.get('headers', [])))
        if not isinstance(column_count, int) or column_count < 1:
            raise ValueError("Column count must be a positive integer")
        
        # Validate row lengths
        for row in data.get('rows', []):
            if not isinstance(row, list) or len(row) != column_count:
                raise ValueError("All rows must have the same number of columns")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render table block as HTML"""
        headers = data.get('headers', [])
        rows = data.get('rows', [])
        
        # Render headers
        header_html = ''
        if headers:
            header_cells = ''.join([f'<th>{header}</th>' for header in headers])
            header_html = f'<thead><tr>{header_cells}</tr></thead>'
        
        # Render rows
        rows_html = []
        for row in rows:
            cells = ''.join([f'<td>{cell}</td>' for cell in row])
            rows_html.append(f'<tr>{cells}</tr>')
        body_html = f'<tbody>{"".join(rows_html)}</tbody>'
        
        return f'<table class="min-w-full">{header_html}{body_html}</table>'