from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (
    CollaborationSession,
    CollaborationPresence,
    CollaborationOperation,
    CollaborationConflict
)
from .serializers import (
    CollaborationSessionSerializer,
    CollaborationPresenceSerializer,
    CollaborationOperationSerializer,
    CollaborationConflictSerializer
)
from apps.workspaces.permissions import IsWorkspaceMember

class CollaborationSessionViewSet(viewsets.ModelViewSet):
    serializer_class = CollaborationSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return CollaborationSession.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug']
        )

    @action(detail=True, methods=['get'])
    def active_users(self, request, workspace_slug=None, pk=None):
        session = self.get_object()
        presences = CollaborationPresence.objects.filter(
            session=session,
            is_active=True
        )
        serializer = CollaborationPresenceSerializer(presences, many=True)
        return Response(serializer.data)

class CollaborationOperationViewSet(viewsets.ModelViewSet):
    serializer_class = CollaborationOperationSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return CollaborationOperation.objects.filter(
            session__page__workspace__slug=self.kwargs['workspace_slug'],
            session_id=self.kwargs['session_pk']
        )

    def perform_create(self, serializer):
        session = get_object_or_404(
            CollaborationSession,
            id=self.kwargs['session_pk']
        )
        serializer.save(session=session, user=self.request.user)

class CollaborationConflictViewSet(viewsets.ModelViewSet):
    serializer_class = CollaborationConflictSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return CollaborationConflict.objects.filter(
            session__page__workspace__slug=self.kwargs['workspace_slug'],
            session_id=self.kwargs['session_pk']
        )

    @action(detail=True, methods=['post'])
    def resolve(self, request, workspace_slug=None, session_pk=None, pk=None):
        conflict = self.get_object()
        conflict.resolved_by = request.user
        conflict.resolution_data = request.data.get('resolution_data')
        conflict.resolved_at = timezone.now()
        conflict.save()
        return Response(
            CollaborationConflictSerializer(conflict).data
        )