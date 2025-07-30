from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.crypto import get_random_string

User = get_user_model()

class Workspace(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name='owned_workspaces', on_delete=models.CASCADE)
    icon = models.ImageField(upload_to='workspace_icons/', blank=True, null=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class WorkspaceMember(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )
    workspace = models.ForeignKey(Workspace, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='workspaces', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    invited_by = models.ForeignKey(User, related_name='invited_members', on_delete=models.SET_NULL, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('workspace', 'user')

class WorkspaceInvite(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
    )
    workspace = models.ForeignKey(Workspace, related_name='invites', on_delete=models.CASCADE)
    email = models.EmailField()
    role = models.CharField(max_length=10, choices=WorkspaceMember.ROLE_CHOICES)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=lambda: timezone.now() + timezone.timedelta(days=7))
    token = models.CharField(max_length=64, unique=True, default=get_random_string)

class WorkspaceSettings(models.Model):
    workspace = models.OneToOneField(Workspace, related_name='settings', on_delete=models.CASCADE)
    allow_public_pages = models.BooleanField(default=False)
    default_role = models.CharField(max_length=10, choices=WorkspaceMember.ROLE_CHOICES, default='viewer')
    enable_comments = models.BooleanField(default=True)
    enable_tasks = models.BooleanField(default=True)
    custom_domain = models.CharField(max_length=255, blank=True, null=True)
    theme_settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
