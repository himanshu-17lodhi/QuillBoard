from django.db import models
from django.urls import reverse
from core.models import BaseModel, User
from workspaces.models import Workspace
from pages.models import Page
import uuid
import json


class Database(BaseModel):
    """Database model for structured data storage"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='databases'
    )
    page = models.OneToOneField(
        Page,
        on_delete=models.CASCADE,
        related_name='database',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('databases:detail', kwargs={'workspace_slug': self.workspace.slug, 'database_id': self.id})


class DatabaseField(BaseModel):
    """Database field definitions"""
    FIELD_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('select', 'Select'),
        ('multi_select', 'Multi-select'),
        ('date', 'Date'),
        ('datetime', 'Date & Time'),
        ('checkbox', 'Checkbox'),
        ('url', 'URL'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('formula', 'Formula'),
        ('relation', 'Relation'),
        ('rollup', 'Rollup'),
        ('people', 'People'),
        ('files', 'Files & Media'),
        ('created_time', 'Created Time'),
        ('created_by', 'Created By'),
        ('last_edited_time', 'Last Edited Time'),
        ('last_edited_by', 'Last Edited By'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='fields'
    )
    name = models.CharField(max_length=200)
    field_type = models.CharField(max_length=30, choices=FIELD_TYPES)
    options = models.JSONField(default=dict, blank=True)  # Field-specific options
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['order', 'name']
        unique_together = ['database', 'order']
    
    def __str__(self):
        return f"{self.database.name} - {self.name} ({self.get_field_type_display()})"


class DatabaseRecord(BaseModel):
    """Database records/rows"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='records'
    )
    data = models.JSONField(default=dict)  # Field values stored as JSON
    order = models.FloatField(default=0)  # For manual ordering
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        # Try to get a meaningful representation from primary field or title
        primary_field = self.database.fields.filter(is_primary=True).first()
        if primary_field and primary_field.name in self.data:
            return str(self.data[primary_field.name])
        elif 'title' in self.data:
            return str(self.data['title'])
        elif 'name' in self.data:
            return str(self.data['name'])
        return f"Record {str(self.id)[:8]}"
    
    def get_field_value(self, field_name):
        """Get formatted field value"""
        return self.data.get(field_name)
    
    def set_field_value(self, field_name, value):
        """Set field value with validation"""
        self.data[field_name] = value


class DatabaseView(BaseModel):
    """Database views for different presentations"""
    VIEW_TYPES = [
        ('table', 'Table'),
        ('kanban', 'Kanban Board'),
        ('gallery', 'Gallery'),
        ('list', 'List'),
        ('calendar', 'Calendar'),
        ('timeline', 'Timeline'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='views'
    )
    name = models.CharField(max_length=200)
    view_type = models.CharField(max_length=20, choices=VIEW_TYPES)
    config = models.JSONField(default=dict)  # View-specific configuration
    filters = models.JSONField(default=list, blank=True)
    sorts = models.JSONField(default=list, blank=True)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.database.name} - {self.name} ({self.get_view_type_display()})"


class DatabaseRelation(BaseModel):
    """Relationships between databases"""
    RELATION_TYPES = [
        ('one_to_one', 'One to One'),
        ('one_to_many', 'One to Many'),
        ('many_to_many', 'Many to Many'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='outgoing_relations'
    )
    to_database = models.ForeignKey(
        Database,
        on_delete=models.CASCADE,
        related_name='incoming_relations'
    )
    from_field = models.ForeignKey(
        DatabaseField,
        on_delete=models.CASCADE,
        related_name='outgoing_relations'
    )
    to_field = models.ForeignKey(
        DatabaseField,
        on_delete=models.CASCADE,
        related_name='incoming_relations'
    )
    relation_type = models.CharField(max_length=20, choices=RELATION_TYPES)
    
    class Meta:
        unique_together = ['from_database', 'to_database', 'from_field']
    
    def __str__(self):
        return f"{self.from_database.name}.{self.from_field.name} -> {self.to_database.name}.{self.to_field.name}"


class DatabaseFormula(BaseModel):
    """Database formulas for calculated fields"""
    field = models.OneToOneField(
        DatabaseField,
        on_delete=models.CASCADE,
        related_name='formula'
    )
    expression = models.TextField()  # Formula expression
    dependencies = models.JSONField(default=list)  # Field names this formula depends on
    
    def __str__(self):
        return f"Formula for {self.field.database.name}.{self.field.name}"
    
    def evaluate(self, record_data):
        """Evaluate the formula with given record data"""
        # This would contain the formula evaluation logic
        # For now, return a placeholder
        return "Formula result"
