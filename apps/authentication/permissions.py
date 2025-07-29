from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsWorkspaceAdmin(permissions.BasePermission):
    """
    Custom permission to only allow workspace admins.
    """
    def has_object_permission(self, request, view, obj):
        return obj.workspace.admins.filter(id=request.user.id).exists()