from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace
import uuid

class Page(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    slug = models.SlugField()
    icon = models.CharField(max_length=255, blank=True)
    cover_image = models.ImageField(upload_to='page_covers/', null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    is_template = models.BooleanField(default=False)

    class Meta:
        unique_together = ('workspace', 'slug')
        ordering = ['-updated_at']

    def __str__(self):
        return self.title