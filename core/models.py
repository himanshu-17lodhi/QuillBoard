from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse


class User(AbstractUser):
    """Extended User model for QuillBoard"""
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    def get_absolute_url(self):
        return reverse('core:profile', kwargs={'pk': self.pk})


class BaseModel(models.Model):
    """Abstract base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='%(class)s_created'
    )
    
    class Meta:
        abstract = True


class Activity(BaseModel):
    """Track user activities across the platform"""
    ACTIVITY_TYPES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('share', 'Shared'),
        ('comment', 'Commented'),
        ('view', 'Viewed'),
    ]
    
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    object_type = models.CharField(max_length=50)  # workspace, page, block, etc.
    object_id = models.PositiveIntegerField()
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Activities'
    
    def __str__(self):
        return f"{self.created_by.username} {self.get_activity_type_display()} {self.object_type}"
