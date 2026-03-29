from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app.plugins.daily_notes import build_daily_note_payload
from app.plugins.markdown_previewer import render_markdown
from app.plugins.registry import list_plugins
from app.schemas.plugins import DailyNoteResponse, MarkdownRenderRequest, MarkdownRenderResponse, PluginManifest

router = APIRouter(prefix="/api")


@router.get("/health")
def healthcheck():
    return {"status": "ok"}


@router.get("/plugins", response_model=list[PluginManifest])
def get_plugins():
    return [
        PluginManifest(
            id=plugin.id,
            name=plugin.name,
            description=plugin.description,
            version=plugin.version,
            schema_names=plugin.schema_names,
        )
        for plugin in list_plugins()
    ]


@router.get("/plugins/daily-notes/today", response_model=DailyNoteResponse)
def get_daily_note_payload(on: str | None = Query(default=None, description="ISO date override such as 2026-03-29")):
    try:
        parsed_date = date.fromisoformat(on) if on else None
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="The `on` query parameter must be a valid ISO date.") from exc

    return DailyNoteResponse(**build_daily_note_payload(parsed_date))


@router.post("/plugins/markdown-previewer/render", response_model=MarkdownRenderResponse)
def render_markdown_preview(body: MarkdownRenderRequest):
    if not body.markdown.strip():
        raise HTTPException(status_code=400, detail="Markdown content must not be empty.")

    return MarkdownRenderResponse(html=render_markdown(body.markdown))
