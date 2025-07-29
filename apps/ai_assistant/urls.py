from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIModelViewSet,
    AIRequestViewSet,
    AIAssistantContextViewSet,
    AIUsageMetricsViewSet
)

router = DefaultRouter()
router.register(r'ai/models', AIModelViewSet, basename='ai-model')
router.register(r'ai/requests', AIRequestViewSet, basename='ai-request')
router.register(
    r'workspaces/(?P<workspace_slug>[\w-]+)/ai/context',
    AIAssistantContextViewSet,
    basename='ai-context'
)
router.register(r'ai/usage', AIUsageMetricsViewSet, basename='ai-usage')

urlpatterns = [
    path('', include(router.urls)),
]