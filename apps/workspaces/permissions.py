from rest_framework import permissions

class IsWorkspaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        workspace_slug = view.kwargs.get('workspace_slug')
        if not workspace_slug:
            return False
        return request.user.workspaces.filter(
            slug=workspace_slug,
            workspacemember__role='admin'
        ).exists()

class IsWorkspaceMember(permissions.BasePermission):
    def has_permission(self, request, view):
        workspace_slug = view.kwargs.get('workspace_slug')
        if not workspace_slug:
            return False
        return request.user.workspaces.filter(slug=workspace_slug).exists()

class CanEditWorkspace(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.members.filter(
            workspacemember__user=request.user,
            workspacemember__role__in=['admin', 'editor']
        ).exists()