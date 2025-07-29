from rest_framework import serializers
from .models import (
    CollaborationSession,
    CollaborationPresence,
    CollaborationOperation,
    CollaborationConflict
)

class CollaborationSessionSerializer(serializers.ModelSerializer):
    active_users_count = serializers.SerializerMethodField()

    class Meta:
        model = CollaborationSession
        fields = ('id', 'page', 'created_at', 'last_activity', 'active_users_count')
        read_only_fields = ('id', 'created_at', 'last_activity')

    def get_active_users_count(self, obj):
        return obj.active_users.filter(
            collaborationpresence__is_active=True
        ).count()

class CollaborationPresenceSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = CollaborationPresence
        fields = ('session', 'user', 'user_name', 'user_avatar',
                 'cursor_position', 'selection_range', 'last_seen', 'is_active')
        read_only_fields = ('session', 'user', 'last_seen')

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_user_avatar(self, obj):
        return obj.user.avatar.url if obj.user.avatar else None

class CollaborationOperationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationOperation
        fields = ('id', 'session', 'user', 'operation_type', 'block_id',
                 'data', 'timestamp', 'version')
        read_only_fields = ('id', 'user', 'timestamp')

class CollaborationConflictSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollaborationConflict
        fields = ('id', 'session', 'operation', 'conflicting_operation',
                 'resolved_by', 'resolution_data', 'created_at', 'resolved_at')
        read_only_fields = ('id', 'created_at', 'resolved_at')