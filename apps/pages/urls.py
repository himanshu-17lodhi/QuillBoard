from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PageViewSet,
    PageVersionViewSet,
    PageShareViewSet,
    PageCommentViewSet
)

router = DefaultRouter()
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages',
    PageViewSet,
    basename='page'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/versions',
    PageVersionViewSet,
    basename='page-version'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/shares',
    PageShareViewSet,
    basename='page-share'
)
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/comments',
    PageCommentViewSet,
    basename='page-comment'
)

urlpatterns = [
    path('', include(router.urls)),
]