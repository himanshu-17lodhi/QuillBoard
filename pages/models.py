from django.db import models
from django.urls import reverse
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from core.models import BaseModel, User
from workspaces.models import Workspace
import uuid


class Page(BaseModel):
    """Page model for hierarchical content structure"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='pages'
    )
    title = models.CharField(max_length=500, default='Untitled')
    icon = models.CharField(max_length=100, blank=True)  # Emoji or icon class
    cover_image = models.ImageField(upload_to='page_covers/', blank=True, null=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)
    is_template = models.BooleanField(default=False)
    template_data = models.JSONField(default=dict, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['parent__id', 'order', 'title']
        unique_together = ['workspace', 'parent', 'order']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('pages:detail', kwargs={'workspace_slug': self.workspace.slug, 'page_id': self.id})
    
    @property
    def full_path(self):
        """Get the full hierarchical path"""
        if self.parent:
            return f"{self.parent.full_path} / {self.title}"
        return self.title
    
    def get_descendants(self):
        """Get all descendant pages"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class Block(BaseModel):
    """Flexible block system for page content"""
    BLOCK_TYPES = [
        ('text', 'Text'),
        ('heading', 'Heading'),
        ('bullet_list', 'Bullet List'),
        ('numbered_list', 'Numbered List'),
        ('todo', 'To-Do'),
        ('toggle', 'Toggle'),
        ('quote', 'Quote'),
        ('divider', 'Divider'),
        ('code', 'Code'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('file', 'File'),
        ('embed', 'Embed'),
        ('bookmark', 'Bookmark'),
        ('table', 'Table'),
        ('database', 'Database'),
        ('formula', 'Formula'),
        ('template', 'Template'),
        ('callout', 'Callout'),
        ('column', 'Column'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='blocks'
    )
    block_type = models.CharField(max_length=30, choices=BLOCK_TYPES)
    content = models.JSONField(default=dict)  # Flexible content storage
    parent_block = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['parent_block__id', 'order']
        unique_together = ['page', 'parent_block', 'order']
    
    def __str__(self):
        content_preview = str(self.content).get('text', str(self.content))[:50] if self.content else ''
        return f"{self.get_block_type_display()}: {content_preview}"
    
    def get_descendants(self):
        """Get all descendant blocks"""
        descendants = []
        for child in self.children.all():
            descendants.append(child)
            descendants.extend(child.get_descendants())
        return descendants


class PagePermission(BaseModel):
    """Page-level permissions"""
    PERMISSION_TYPES = [
        ('view', 'View'),
        ('comment', 'Comment'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    ]
    
    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='permissions'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='page_permissions'
    )
    permission_type = models.CharField(max_length=20, choices=PERMISSION_TYPES)
    
    class Meta:
        unique_together = ['page', 'user', 'permission_type']
    
    def __str__(self):
        return f"{self.user.username} - {self.page.title} ({self.permission_type})"


class Comment(BaseModel):
    """Comments on pages and blocks"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    
    # Generic foreign key to support comments on different objects
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    parent_comment = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies'
    )
    is_resolved = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.created_by.username}: {self.content[:50]}"


class Template(BaseModel):
    """Reusable page templates"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='templates',
        null=True,
        blank=True  # Global templates
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)
    template_data = models.JSONField()  # Page and block data
    is_public = models.BooleanField(default=False)
    usage_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return self.name
