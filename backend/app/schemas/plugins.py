from typing import Any

from pydantic import BaseModel, Field


class PluginManifest(BaseModel):
    id: str
    name: str
    description: str
    version: str
    schema_names: list[str] = Field(default_factory=list)


class DailyNoteResponse(BaseModel):
    title: str
    slug: str
    suggested_folder: str


class MarkdownRenderRequest(BaseModel):
    markdown: str


class MarkdownRenderResponse(BaseModel):
    html: str


class PluginPayload(BaseModel):
    payload: dict[str, Any]

