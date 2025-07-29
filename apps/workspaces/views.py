from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer
from .permissions import IsWorkspaceAdmin

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(
            workspacemember__user=self.request.user
        ).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='admin'
        )

    @action(detail=True, methods=['post'], permission_classes=[IsWorkspaceAdmin])
    def invite_member(self, request, pk=None):
        workspace = self.get_object()
        email = request.data.get('email')
        role = request.data.get('role', 'viewer')
        
        try:
            user = User.objects.get(email=email)
            member, created = WorkspaceMember.objects.get_or_create(
                workspace=workspace,
                user=user,
                defaults={'role': role}
            )
            return Response(WorkspaceMemberSerializer(member).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )