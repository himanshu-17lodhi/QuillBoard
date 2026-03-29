from datetime import date

from app.plugins.base import BackendPlugin


plugin = BackendPlugin(
    id="daily-notes",
    name="Daily Notes",
    description="Creates and indexes date-based notes.",
    version="0.1.0",
    schema_names=["daily_notes_preferences"],
)


def build_daily_note_payload(target_date: date | None = None) -> dict[str, str]:
    target = target_date or date.today()
    title = target.isoformat()
    return {
        "title": title,
        "slug": f"daily/{title}",
        "suggested_folder": "Daily Notes",
    }

