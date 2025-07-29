from django.utils.translation import gettext_lazy as _
from typing import Dict, Any

class BaseBlock:
    block_type = None
    schema = {}
    
    def __init__(self, data: Dict[str, Any]):
        self.data = data
        
    def validate(self) -> bool:
        """Validate block data against schema"""
        raise NotImplementedError
        
    def render(self) -> Dict[str, Any]:
        """Return block data in renderable format"""
        raise NotImplementedError

    @classmethod
    def create(cls, data: Dict[str, Any]) -> 'BaseBlock':
        instance = cls(data)
        if not instance.validate():
            raise ValueError(_("Invalid block data"))
        return instance