from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace
import uuid

class Template(models.Model):
    TEMPLATE_TYPES = (
        ('page', 'Page Template'),
        ('block', 'Block Template'),
        ('component', 'Component Template'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='templates'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    content = models.JSONField()
    icon = models.CharField(max_length=50, blank=True)  # Emoji or icon class
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_templates'
    )
    is_public = models.BooleanField(default=False)
    times_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-times_used', '-created_at']
        indexes = [
            models.Index(fields=['workspace', 'type', 'is_public']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

class TemplateCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='template_categories'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Template categories'
        ordering = ['name']
        unique_together = ('workspace', 'name')

    def __str__(self):
        return self.name

class TemplateVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    content = models.JSONField()
    version_number = models.PositiveIntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ('template', 'version_number')

    def __str__(self):
        return f"{self.template.name} v{self.version_number}"

class TemplateCategorization(models.Model):
    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name='categorizations'
    )
    category = models.ForeignKey(
        TemplateCategory,
        on_delete=models.CASCADE,
        related_name='templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('template', 'category')

    def __str__(self):
        return f"{self.template.name} in {self.category.name}"