from django.contrib import admin
from .models import Database, DatabaseField, DatabaseRecord, DatabaseView, DatabaseRelation, DatabaseFormula


@admin.register(Database)
class DatabaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'created_by', 'created_at')
    list_filter = ('workspace', 'created_at')
    search_fields = ('name', 'description', 'workspace__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DatabaseField)
class DatabaseFieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'database', 'field_type', 'order', 'is_required', 'is_primary')
    list_filter = ('field_type', 'is_required', 'is_primary', 'database')
    search_fields = ('name', 'database__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DatabaseRecord)
class DatabaseRecordAdmin(admin.ModelAdmin):
    list_display = ('database', 'order', 'created_by', 'created_at')
    list_filter = ('database', 'created_at')
    search_fields = ('database__name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DatabaseView)
class DatabaseViewAdmin(admin.ModelAdmin):
    list_display = ('name', 'database', 'view_type', 'is_default', 'created_at')
    list_filter = ('view_type', 'is_default', 'database', 'created_at')
    search_fields = ('name', 'database__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DatabaseRelation)
class DatabaseRelationAdmin(admin.ModelAdmin):
    list_display = ('from_database', 'to_database', 'relation_type', 'created_at')
    list_filter = ('relation_type', 'created_at')
    search_fields = ('from_database__name', 'to_database__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DatabaseFormula)
class DatabaseFormulaAdmin(admin.ModelAdmin):
    list_display = ('field', 'expression', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('field__name', 'expression')
    readonly_fields = ('created_at', 'updated_at')
