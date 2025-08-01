from django.db import models
from django.urls import reverse
from core.models import BaseModel, User
import uuid


class Workspace(BaseModel):
    """Workspace model for multi-tenant support"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=100, blank=True)  # Emoji or icon class
    is_active = models.BooleanField(default=True)
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('workspaces:detail', kwargs={'slug': self.slug})


class WorkspaceMember(BaseModel):
    """Workspace membership with roles"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Administrator'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ]
    
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='members'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='workspace_memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['workspace', 'user']
        ordering = ['role', 'user__username']
    
    def __str__(self):
        return f"{self.user.username} - {self.workspace.name} ({self.role})"
    
    @property
    def can_edit(self):
        return self.role in ['owner', 'admin', 'editor']
    
    @property
    def can_admin(self):
        return self.role in ['owner', 'admin']


class WorkspaceInvite(BaseModel):
    """Workspace invitations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='invites'
    )
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=WorkspaceMember.ROLE_CHOICES, default='viewer')
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_accepted = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    
    class Meta:
        unique_together = ['workspace', 'email']
    
    def __str__(self):
        return f"Invite to {self.workspace.name} for {self.email}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
