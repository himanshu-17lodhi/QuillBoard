from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    NotificationTemplate,
    Notification,
    NotificationPreference,
    EmailNotification
)
from .serializers import (
    NotificationTemplateSerializer,
    NotificationSerializer,
    NotificationPreferenceSerializer,
    EmailNotificationSerializer,
    NotificationBulkUpdateSerializer
)
from .services import NotificationService

class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAdminUser]

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        serializer = NotificationBulkUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        notification_ids = serializer.validated_data['notification_ids']
        action = serializer.validated_data['action']
        
        if action == 'mark_read':
            NotificationService.mark_as_read(notification_ids, request.user)
        else:
            NotificationService.mark_as_unread(notification_ids, request.user)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        now = timezone.now()
        self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=now
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NotificationPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EmailNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EmailNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmailNotification.objects.filter(
            notification__recipient=self.request.user
        )