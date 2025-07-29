from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Page, PageVersion, PageShare, PageComment
from .serializers import (
    PageSerializer,
    PageVersionSerializer,
    PageShareSerializer,
    PageCommentSerializer
)
from apps.workspaces.permissions import IsWorkspaceMember, CanEditWorkspace

class PageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    lookup_field = 'slug'

    def get_queryset(self):
        workspace_slug = self.kwargs['workspace_slug']
        return Page.objects.filter(
            workspace__slug=workspace_slug,
            is_archived=False
        ).select_related('creator', 'last_editor')

    def perform_create(self, serializer):
        workspace_slug = self.kwargs['workspace_slug']
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        serializer.save(
            workspace=workspace,
            creator=self.request.user,
            last_editor=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(last_editor=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, workspace_slug=None, slug=None):
        page = self.get_object()
        user = request.user
        
        if page.is_favorite.filter(id=user.id).exists():
            page.is_favorite.remove(user)
            favorited = False
        else:
            page.is_favorite.add(user)
            favorited = True
        
        return Response({'favorited': favorited})

    @action(detail=True, methods=['post'])
    def archive(self, request, workspace_slug=None, slug=None):
        page = self.get_object()
        page.is_archived = True
        page.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PageVersionViewSet(viewsets.ModelViewSet):
    serializer_class = PageVersionSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return PageVersion.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug'],
            page__slug=self.kwargs['page_slug']
        )

    def perform_create(self, serializer):
        page = get_object_or_404(
            Page,
            workspace__slug=self.kwargs['workspace_slug'],
            slug=self.kwargs['page_slug']
        )
        serializer.save(page=page, editor=self.request.user)

class PageShareViewSet(viewsets.ModelViewSet):
    serializer_class = PageShareSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditWorkspace]

    def get_queryset(self):
        return PageShare.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug'],
            page__slug=self.kwargs['page_slug']
        )

    def perform_create(self, serializer):
        page = get_object_or_404(
            Page,
            workspace__slug=self.kwargs['workspace_slug'],
            slug=self.kwargs['page_slug']
        )
        serializer.save(page=page, shared_by=self.request.user)

class PageCommentViewSet(viewsets.ModelViewSet):
    serializer_class = PageCommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return PageComment.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug'],
            page__slug=self.kwargs['page_slug'],
            parent=None
        )

    def perform_create(self, serializer):
        page = get_object_or_404(
            Page,
            workspace__slug=self.kwargs['workspace_slug'],
            slug=self.kwargs['page_slug']
        )
        serializer.save(page=page, user=self.request.user)

    @action(detail=True, methods=['post'])
    def resolve(self, request, workspace_slug=None, page_slug=None, pk=None):
        comment = self.get_object()
        comment.is_resolved = True
        comment.save()
        return Response(status=status.HTTP_204_NO_CONTENT)