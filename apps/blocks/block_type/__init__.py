from .text import TextBlock
from .heading import HeadingBlock
from .list import ListBlock
from .table import TableBlock
from .image import ImageBlock
from .code import CodeBlock
from .embed import EmbedBlock

BLOCK_TYPES = {
    'text': TextBlock,
    'heading': HeadingBlock,
    'list': ListBlock,
    'table': TableBlock,
    'image': ImageBlock,
    'code': CodeBlock,
    'embed': EmbedBlock,
}