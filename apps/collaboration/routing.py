from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r'ws/collaboration/(?P<page_id>[^/]+)/$',
        consumers.CollaborationConsumer.as_asgi()
    ),
]