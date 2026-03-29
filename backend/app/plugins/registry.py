from app.plugins.daily_notes import plugin as daily_notes_plugin
from app.plugins.markdown_previewer import plugin as markdown_previewer_plugin


PLUGIN_REGISTRY = {
    daily_notes_plugin.id: daily_notes_plugin,
    markdown_previewer_plugin.id: markdown_previewer_plugin,
}


def list_plugins():
    return list(PLUGIN_REGISTRY.values())


def get_plugin(plugin_id: str):
    return PLUGIN_REGISTRY.get(plugin_id)

