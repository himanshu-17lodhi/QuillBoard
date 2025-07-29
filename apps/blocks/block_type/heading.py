from .base import BaseBlock

class HeadingBlock(BaseBlock):
    block_type = "heading"
    schema = {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "maxLength": 1000
            },
            "level": {
                "type": "integer",
                "minimum": 1,
                "maximum": 3
            }
        },
        "required": ["content", "level"]
    }

    def validate(self):
        if not isinstance(self.data.get('content'), str):
            return False
        if not isinstance(self.data.get('level'), int):
            return False
        if self.data.get('level') not in [1, 2, 3]:
            return False
        return True

    def render(self):
        return {
            "type": self.block_type,
            "content": self.data.get('content'),
            "level": self.data.get('level')
        }