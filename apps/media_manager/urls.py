from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MediaFileViewSet,
    MediaFolderViewSet,
    MediaUsageViewSet,
    MediaShareViewSet
)

router = DefaultRouter()
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/media/files',
    MediaFileViewSet,
    basename='media-file'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/media/folders',
    MediaFolderViewSet,
    basename='media-folder'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/media/usage',
    MediaUsageViewSet,
    basename='media-usage'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/media/shares',
    MediaShareViewSet,
    basename='media-share'
)

urlpatterns = [
    path('', include(router.urls)),
]