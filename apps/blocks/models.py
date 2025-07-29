from django.db import models
from django.conf import settings
from apps.pages.models import Page
import uuid

class Block(models.Model):
    BLOCK_TYPES = (
        ('text', 'Text'),
        ('heading', 'Heading'),
        ('list', 'List'),
        ('todo', 'Todo'),
        ('toggle', 'Toggle'),
        ('code', 'Code'),
        ('image', 'Image'),
        ('embed', 'Embed'),
        ('table', 'Table'),
        ('divider', 'Divider'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='blocks'
    )
    type = models.CharField(max_length=20, choices=BLOCK_TYPES)
    content = models.JSONField()
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='children'
    )
    order = models.FloatField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_blocks'
    )
    last_edited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='last_edited_blocks'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"{self.type} Block - {self.id}"

class BlockAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    block = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(upload_to='block_attachments/')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.IntegerField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class BlockVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    block = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    content = models.JSONField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Version of {self.block.id} at {self.created_at}"