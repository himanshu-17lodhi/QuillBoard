from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceSettings
from .serializers import (
    WorkspaceSerializer,
    WorkspaceMemberSerializer,
    WorkspaceInviteSerializer,
    WorkspaceSettingsSerializer
)
from .permissions import IsWorkspaceAdmin, IsWorkspaceMember

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return Workspace.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        workspace = serializer.save(owner=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='admin'
        )
        WorkspaceSettings.objects.create(workspace=workspace)

    @action(detail=True, methods=['post'])
    def invite(self, request, slug=None):
        workspace = self.get_object()
        if not workspace.members.filter(
            workspacemember__user=request.user,
            workspacemember__role='admin'
        ).exists():
            return Response(
                {"error": "Only admins can invite members"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WorkspaceInviteSerializer(
            data=request.data,
            context={'workspace': workspace}
        )
        if serializer.is_valid():
            invite = serializer.save(
                workspace=workspace,
                invited_by=request.user,
                expires_at=timezone.now() + timedelta(days=7)
            )
            # Send invite email here
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkspaceMemberViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        workspace_slug = self.kwargs['workspace_slug']
        return WorkspaceMember.objects.filter(workspace__slug=workspace_slug)

    def perform_create(self, serializer):
        workspace = get_object_or_404(Workspace, slug=self.kwargs['workspace_slug'])
        if not workspace.members.filter(
            workspacemember__user=self.request.user,
            workspacemember__role='admin'
        ).exists():
            return Response(
                {"error": "Only admins can add members"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save(workspace=workspace)

class WorkspaceSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSettingsSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceAdmin]

    def get_queryset(self):
        return WorkspaceSettings.objects.filter(
            workspace__members=self.request.user,
            workspace__workspacemember__role='admin'
        )

    def get_object(self):
        workspace_slug = self.kwargs['workspace_slug']
        return get_object_or_404(
            WorkspaceSettings,
            workspace__slug=workspace_slug
        )