from django.db import models
from django.conf import settings
from apps.pages.models import Page
import uuid

class Block(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(Page, related_name='blocks', on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    content = models.JSONField()
    order = models.FloatField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.type} block in {self.page.title}"