from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkspaceViewSet,
    WorkspaceMemberViewSet,
    WorkspaceSettingsViewSet
)

router = DefaultRouter()
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/members',
    WorkspaceMemberViewSet,
    basename='workspace-member'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/settings',
    WorkspaceSettingsViewSet,
    basename='workspace-settings'
)

urlpatterns = [
    path('', include(router.urls)),
]