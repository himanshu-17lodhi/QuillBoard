from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/pages/(?P<page_id>[^/]+)/$', consumers.PageConsumer.as_asgi()),
    re_path(r'ws/workspaces/(?P<workspace_slug>[^/]+)/$', consumers.WorkspaceConsumer.as_asgi()),
]