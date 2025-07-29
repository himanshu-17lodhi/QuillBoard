from django.db import models
from django.conf import settings
from apps.pages.models import Page
from apps.blocks.models import Block
import uuid

class AIModel(models.Model):
    MODEL_TYPES = (
        ('openai', 'OpenAI'),
        ('huggingface', 'HuggingFace'),
        ('custom', 'Custom Model'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    provider = models.CharField(max_length=20, choices=MODEL_TYPES)
    model_identifier = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.provider})"

class AIRequest(models.Model):
    REQUEST_TYPES = (
        ('summarize', 'Summarize'),
        ('rewrite', 'Rewrite'),
        ('generate', 'Generate'),
        ('explain', 'Explain'),
        ('translate', 'Translate'),
        ('analyze', 'Analyze'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_requests'
    )
    model = models.ForeignKey(
        AIModel,
        on_delete=models.SET_NULL,
        null=True
    )
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    input_data = models.JSONField()
    output_data = models.JSONField(null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
    
    class Meta:
        ordering = ['-created_at']

class AIAssistantContext(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(
        Page,
        on_delete=models.CASCADE,
        related_name='ai_contexts'
    )
    block = models.ForeignKey(
        Block,
        on_delete=models.CASCADE,
        related_name='ai_contexts',
        null=True
    )
    context_type = models.CharField(max_length=50)
    context_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('page', 'block', 'context_type')

class AIUsageMetrics(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_usage'
    )
    model = models.ForeignKey(
        AIModel,
        on_delete=models.CASCADE,
        related_name='usage_metrics'
    )
    request_type = models.CharField(max_length=20, choices=AIRequest.REQUEST_TYPES)
    tokens_used = models.IntegerField(default=0)
    cost = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'model', 'request_type', 'date')