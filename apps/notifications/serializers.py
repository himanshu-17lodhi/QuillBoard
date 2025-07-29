from rest_framework import serializers
from .models import (
    NotificationTemplate,
    Notification,
    NotificationPreference,
    EmailNotification
)

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = (
            'id', 'name', 'type', 'subject', 'body', 'html_body',
            'variables', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class NotificationSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = (
            'id', 'recipient', 'template', 'type', 'title', 'message',
            'data', 'content_type', 'content_type_name', 'object_id',
            'is_read', 'read_at', 'created_at'
        )
        read_only_fields = (
            'id', 'recipient', 'template', 'type', 'title', 'message',
            'data', 'content_type', 'object_id', 'created_at'
        )

    def get_content_type_name(self, obj):
        return obj.content_type.model

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = (
            'id', 'user', 'notification_type', 'channel',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = (
            'id', 'notification', 'recipient_email', 'subject',
            'body', 'html_body', 'status', 'error_message',
            'sent_at', 'created_at'
        )
        read_only_fields = (
            'id', 'notification', 'status', 'error_message',
            'sent_at', 'created_at'
        )

class NotificationBulkUpdateSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.UUIDField()
    )
    action = serializers.ChoiceField(choices=['mark_read', 'mark_unread'])