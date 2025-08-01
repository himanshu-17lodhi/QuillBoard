from django.contrib import admin
from .models import Page, Block, Comment, Template, PagePermission


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace', 'created_by', 'is_published', 'is_template', 'created_at')
    list_filter = ('is_published', 'is_template', 'workspace', 'created_at')
    search_fields = ('title', 'workspace__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('page', 'block_type', 'order', 'is_active', 'created_at')
    list_filter = ('block_type', 'is_active', 'created_at')
    search_fields = ('page__title',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('created_by', 'content_type', 'object_id', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'content_type', 'created_at')
    search_fields = ('created_by__username', 'content')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'category', 'is_public', 'usage_count', 'created_at')
    list_filter = ('is_public', 'category', 'workspace', 'created_at')
    search_fields = ('name', 'description', 'category')
    readonly_fields = ('created_at', 'updated_at', 'usage_count')


@admin.register(PagePermission)
class PagePermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'page', 'permission_type', 'created_at')
    list_filter = ('permission_type', 'created_at')
    search_fields = ('user__username', 'page__title')
