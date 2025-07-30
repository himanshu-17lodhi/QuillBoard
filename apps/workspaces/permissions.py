from rest_framework import permissions
from apps.workspaces.models import WorkspaceMember


class IsWorkspaceMember(permissions.BasePermission):
    """
    Allows access only to members of the workspace.
    """

    def has_permission(self, request, view):
        workspace_id = view.kwargs.get('workspace_id') or request.data.get('workspace')
        if not workspace_id:
            return False
        return WorkspaceMember.objects.filter(
            user=request.user,
            workspace_id=workspace_id
        ).exists()


class CanEditWorkspace(permissions.BasePermission):
    """
    Custom permission to allow only workspace admins or editors to perform write actions.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        workspace_id = view.kwargs.get('workspace_id') or request.data.get('workspace')
        if not workspace_id:
            return False

        try:
            membership = WorkspaceMember.objects.get(
                user=request.user,
                workspace_id=workspace_id
            )
            return membership.role in ['admin', 'editor']
        except WorkspaceMember.DoesNotExist:
            return False


class IsWorkspaceAdmin(permissions.BasePermission):
    """
    Allows access only to workspace admins.
    """

    def has_permission(self, request, view):
        workspace_id = view.kwargs.get('workspace_id') or request.data.get('workspace')
        if not workspace_id:
            return False

        try:
            membership = WorkspaceMember.objects.get(
                user=request.user,
                workspace_id=workspace_id
            )
            return membership.role == 'admin'
        except WorkspaceMember.DoesNotExist:
            return False
