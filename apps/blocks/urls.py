from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlockViewSet,
    # BlockAttachmentViewSet,
    BlockVersionViewSet
)

router = DefaultRouter()
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/blocks',
    BlockViewSet,
    basename='block'
)
# router.register(
#     r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/blocks/(?P<block_pk>[^/.]+)/attachments',
#     BlockAttachmentViewSet,
#     basename='block-attachment'
# )
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/pages/(?P<page_slug>[\w-]+)/blocks/(?P<block_pk>[^/.]+)/versions',
    BlockVersionViewSet,
    basename='block-version'
)

urlpatterns = [
    path('', include(router.urls)),
]