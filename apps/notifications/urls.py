from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationTemplateViewSet,
    NotificationViewSet,
    NotificationPreferenceViewSet,
    EmailNotificationViewSet
)

router = DefaultRouter()
router.register(
    'notification-templates',
    NotificationTemplateViewSet,
    basename='notification-template'
)
router.register(
    'notifications',
    NotificationViewSet,
    basename='notification'
)
router.register(
    'notification-preferences',
    NotificationPreferenceViewSet,
    basename='notification-preference'
)
router.register(
    'email-notifications',
    EmailNotificationViewSet,
    basename='email-notification'
)

urlpatterns = [
    path('', include(router.urls)),
]