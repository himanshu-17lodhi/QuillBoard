from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CollaborationSessionViewSet,
    CollaborationOperationViewSet,
    CollaborationConflictViewSet
)

router = DefaultRouter()
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/collaboration',
    CollaborationSessionViewSet,
    basename='collaboration-session'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/collaboration/(?P<session_pk>[^/.]+)/operations',
    CollaborationOperationViewSet,
    basename='collaboration-operation'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/collaboration/(?P<session_pk>[^/.]+)/conflicts',
    CollaborationConflictViewSet,
    basename='collaboration-conflict'
)

urlpatterns = [
    path('', include(router.urls)),
]