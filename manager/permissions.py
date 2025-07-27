from rest_framework import permissions
from .models import DocumentPermission

class DocumentPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user == obj.owner:
            return True
        try:
            perm = DocumentPermission.objects.get(document=obj, user=request.user)
            if request.method in permissions.SAFE_METHODS:
                return perm.role in ['admin', 'editor', 'viewer']
            return perm.role in ['admin', 'editor']
        except DocumentPermission.DoesNotExist:
            return False