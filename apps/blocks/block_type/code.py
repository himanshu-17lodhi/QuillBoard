import pygments
from pygments import lexers, formatters
from pygments.util import ClassNotFound

class CodeBlock:
    type = 'code'
    schema = {
        'code': str,
        'language': str,
        'filename': str
    }
    
    @classmethod
    def validate(cls, data):
        """Validate code block data"""
        if not isinstance(data.get('code'), str):
            raise ValueError("Code must be a string")
            
        language = data.get('language', '')
        if language:
            try:
                lexers.get_lexer_by_name(language)
            except ClassNotFound:
                raise ValueError(f"Unsupported language: {language}")
        
        return True

    @classmethod
    def render_html(cls, data):
        """Render code block as HTML"""
        code = data.get('code', '')
        language = data.get('language', '')
        filename = data.get('filename', '')
        
        try:
            lexer = lexers.get_lexer_by_name(language) if language else lexers.guess_lexer(code)
        except ClassNotFound:
            lexer = lexers.get_lexer_by_name('text')
            
        formatter = formatters.HtmlFormatter(
            style='monokai',
            linenos=True,
            cssclass='highlight'
        )
        
        highlighted_code = pygments.highlight(code, lexer, formatter)
        
        if filename:
            return f'<div class="code-block"><div class="code-filename">{filename}</div>{highlighted_code}</div>'
        return f'<div class="code-block">{highlighted_code}</div>'