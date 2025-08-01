from django.contrib import admin
from .models import Workspace, WorkspaceMember, WorkspaceInvite


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_by', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at')


@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'workspace', 'role', 'is_active', 'joined_at')
    list_filter = ('role', 'is_active', 'joined_at')
    search_fields = ('user__username', 'workspace__name')
    readonly_fields = ('joined_at',)


@admin.register(WorkspaceInvite)
class WorkspaceInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'workspace', 'role', 'is_accepted', 'expires_at', 'created_at')
    list_filter = ('role', 'is_accepted', 'expires_at', 'created_at')
    search_fields = ('email', 'workspace__name')
    readonly_fields = ('created_at', 'updated_at')
