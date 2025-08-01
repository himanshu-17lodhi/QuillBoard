from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Activity


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar', 'bio')}),
    )


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('created_by', 'activity_type', 'object_type', 'description', 'created_at')
    list_filter = ('activity_type', 'object_type', 'created_at')
    search_fields = ('created_by__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
