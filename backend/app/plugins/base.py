from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class BackendPlugin:
    id: str
    name: str
    description: str
    version: str
    schema_names: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

