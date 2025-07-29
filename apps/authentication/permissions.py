from rest_framework import permissions

class IsVerifiedUser(permissions.BasePermission):
    """
    Permission check for verified users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified

class IsSameUser(permissions.BasePermission):
    """
    Permission check for same user.
    """
    def has_object_permission(self, request, view, obj):
        return obj == request.user

class CanManageUsers(permissions.BasePermission):
    """
    Permission check for user management.
    Only staff users can manage other users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff