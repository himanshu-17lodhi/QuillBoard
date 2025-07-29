from .base import BaseBlock

class TextBlock(BaseBlock):
    block_type = "text"
    schema = {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "maxLength": 10000
            },
            "formatting": {
                "type": "object",
                "properties": {
                    "bold": {"type": "array"},
                    "italic": {"type": "array"},
                    "underline": {"type": "array"},
                    "strike": {"type": "array"},
                    "code": {"type": "array"},
                    "color": {"type": "array"},
                    "background": {"type": "array"}
                }
            }
        },
        "required": ["content"]
    }

    def validate(self):
        if not isinstance(self.data.get('content'), str):
            return False
        if len(self.data.get('content', '')) > 10000:
            return False
        return True

    def render(self):
        return {
            "type": self.block_type,
            "content": self.data.get('content', ''),
            "formatting": self.data.get('formatting', {})
        }