from django.db import models
from django.conf import settings
from apps.pages.models import Page
import uuid

class CollaborationSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='collaboration_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    active_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='CollaborationPresence',
        related_name='active_sessions'
    )

    def __str__(self):
        return f"Session for {self.page.title}"

class CollaborationPresence(models.Model):
    session = models.ForeignKey(CollaborationSession, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cursor_position = models.JSONField(default=dict)
    selection_range = models.JSONField(default=dict)
    last_seen = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('session', 'user')

class CollaborationOperation(models.Model):
    OPERATION_TYPES = (
        ('insert', 'Insert'),
        ('delete', 'Delete'),
        ('update', 'Update'),
        ('move', 'Move'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        CollaborationSession,
        on_delete=models.CASCADE,
        related_name='operations'
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    operation_type = models.CharField(max_length=10, choices=OPERATION_TYPES)
    block_id = models.UUIDField()
    data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    version = models.IntegerField()

    class Meta:
        ordering = ['timestamp']

class CollaborationConflict(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(CollaborationSession, on_delete=models.CASCADE)
    operation = models.ForeignKey(CollaborationOperation, on_delete=models.CASCADE)
    conflicting_operation = models.ForeignKey(
        CollaborationOperation,
        on_delete=models.CASCADE,
        related_name='conflicts'
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    resolution_data = models.JSONField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True)