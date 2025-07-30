from rest_framework import viewsets, permissions
from .models import Workspace, WorkspaceMember, WorkspaceSettings, WorkspaceInvite
from apps.pages.models import Page
from .serializers import (
    WorkspaceSerializer,
    WorkspaceMemberSerializer,
    WorkspaceSettingsSerializer,
    WorkspaceInviteSerializer
)
from apps.pages.serializers import PageSerializer
from .permissions import IsWorkspaceAdmin, IsWorkspaceMember, CanEditWorkspace

class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='admin',
            invited_by=self.request.user
        )


class WorkspaceMemberViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [IsWorkspaceAdmin]

    def get_queryset(self):
        return WorkspaceMember.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )


class WorkspaceSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSettingsSerializer
    permission_classes = [IsWorkspaceAdmin]

    def get_queryset(self):
        return WorkspaceSettings.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )


class WorkspaceInviteViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceInviteSerializer
    permission_classes = [IsWorkspaceAdmin]

    def get_queryset(self):
        return WorkspaceInvite.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )

    def perform_create(self, serializer):
        workspace_slug = self.kwargs['workspace_slug']
        workspace = Workspace.objects.get(slug=workspace_slug)
        serializer.save(
            invited_by=self.request.user,
            workspace=workspace
        )


class WorkspacePageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        workspace_slug = self.kwargs['workspace_slug']
        return Page.objects.filter(workspace__slug=workspace_slug, is_archived=False)

    def perform_create(self, serializer):
        workspace = Workspace.objects.get(slug=self.kwargs['workspace_slug'])
        serializer.save(workspace=workspace, creator=self.request.user, last_editor=self.request.user)
