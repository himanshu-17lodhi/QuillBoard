from markdown_it import MarkdownIt

from app.plugins.base import BackendPlugin


plugin = BackendPlugin(
    id="markdown-previewer",
    name="Markdown Previewer",
    description="Renders markdown for sidebar preview panels.",
    version="0.1.0",
    schema_names=["markdown_previewer_snapshots"],
)


renderer = MarkdownIt("commonmark", {"html": False, "linkify": True, "typographer": True})


def render_markdown(markdown: str) -> str:
    return renderer.render(markdown)

