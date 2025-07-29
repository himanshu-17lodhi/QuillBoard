from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid

class Workspace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_workspaces'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='WorkspaceMember',
        related_name='workspaces'
    )
    icon = models.ImageField(upload_to='workspace_icons/', null=True, blank=True)
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class WorkspaceMember(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    )

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    joined_at = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workspace_invites_sent'
    )

    class Meta:
        unique_together = ('workspace', 'user')

class WorkspaceInvite(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=WorkspaceMember.ROLE_CHOICES)
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('workspace', 'email')

class WorkspaceSettings(models.Model):
    workspace = models.OneToOneField(
        Workspace,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    allow_public_pages = models.BooleanField(default=False)
    default_role = models.CharField(
        max_length=20,
        choices=WorkspaceMember.ROLE_CHOICES,
        default='viewer'
    )
    enable_comments = models.BooleanField(default=True)
    enable_tasks = models.BooleanField(default=True)
    custom_domain = models.CharField(max_length=255, blank=True)
    theme_settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)