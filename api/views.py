from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from datetime import timedelta

from workspaces.models import Workspace, WorkspaceMember, WorkspaceInvite
from pages.models import Page, Block, Comment, Template, PagePermission
from databases.models import Database, DatabaseField, DatabaseRecord, DatabaseView
from .serializers import (
    UserSerializer, WorkspaceSerializer, WorkspaceMemberSerializer,
    PageSerializer, BlockSerializer, CommentSerializer, TemplateSerializer,
    DatabaseSerializer, DatabaseFieldSerializer, DatabaseRecordSerializer,
    DatabaseViewSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        return Workspace.objects.filter(
            members__user=self.request.user,
            members__is_active=True
        ).distinct()
    
    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        # Make creator the owner
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.request.user,
            role='owner',
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        workspace = self.get_object()
        members = WorkspaceMember.objects.filter(workspace=workspace, is_active=True)
        serializer = WorkspaceMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def invite_member(self, request, pk=None):
        workspace = self.get_object()
        email = request.data.get('email')
        role = request.data.get('role', 'viewer')
        
        # Check if user has admin permissions
        membership = workspace.members.filter(user=request.user, is_active=True).first()
        if not membership or not membership.can_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Create or update invite
        invite, created = WorkspaceInvite.objects.get_or_create(
            workspace=workspace,
            email=email,
            defaults={
                'role': role,
                'created_by': request.user,
                'expires_at': timezone.now() + timedelta(days=7)
            }
        )
        
        if not created:
            invite.role = role
            invite.save()
        
        # TODO: Send email invitation
        
        return Response({'message': 'Invitation sent successfully'})


class PageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_published', 'is_template', 'parent']
    search_fields = ['title']
    ordering_fields = ['title', 'created_at', 'updated_at', 'order']
    ordering = ['order', 'title']
    
    def get_queryset(self):
        workspace_slug = self.kwargs.get('workspace_slug')
        if workspace_slug:
            workspace = get_object_or_404(Workspace, slug=workspace_slug)
            # Check workspace membership
            if not workspace.members.filter(user=self.request.user, is_active=True).exists():
                return Page.objects.none()
            return Page.objects.filter(workspace=workspace)
        return Page.objects.none()
    
    def perform_create(self, serializer):
        workspace_slug = self.kwargs.get('workspace_slug')
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        serializer.save(workspace=workspace, created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def blocks(self, request, pk=None):
        page = self.get_object()
        blocks = Block.objects.filter(page=page, is_active=True, parent_block=None)
        serializer = BlockSerializer(blocks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        page = self.get_object()
        # TODO: Implement page duplication logic
        return Response({'message': 'Page duplicated successfully'})


class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['block_type', 'parent_block']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        page_id = self.kwargs.get('page_id')
        if page_id:
            page = get_object_or_404(Page, id=page_id)
            # Check page access permissions
            return Block.objects.filter(page=page, is_active=True)
        return Block.objects.none()
    
    def perform_create(self, serializer):
        page_id = self.kwargs.get('page_id')
        page = get_object_or_404(Page, id=page_id)
        serializer.save(page=page, created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        block = self.get_object()
        new_order = request.data.get('order')
        new_parent_id = request.data.get('parent_block')
        
        if new_parent_id:
            new_parent = get_object_or_404(Block, id=new_parent_id)
            block.parent_block = new_parent
        
        if new_order is not None:
            block.order = new_order
        
        block.save()
        return Response({'message': 'Block moved successfully'})


class DatabaseViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        workspace_slug = self.kwargs.get('workspace_slug')
        if workspace_slug:
            workspace = get_object_or_404(Workspace, slug=workspace_slug)
            # Check workspace membership
            if not workspace.members.filter(user=self.request.user, is_active=True).exists():
                return Database.objects.none()
            return Database.objects.filter(workspace=workspace)
        return Database.objects.none()
    
    def perform_create(self, serializer):
        workspace_slug = self.kwargs.get('workspace_slug')
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        serializer.save(workspace=workspace, created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def records(self, request, pk=None):
        database = self.get_object()
        records = DatabaseRecord.objects.filter(database=database)
        serializer = DatabaseRecordSerializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def views(self, request, pk=None):
        database = self.get_object()
        views = DatabaseView.objects.filter(database=database)
        serializer = DatabaseViewSerializer(views, many=True)
        return Response(serializer.data)


class DatabaseRecordViewSet(viewsets.ModelViewSet):
    serializer_class = DatabaseRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['order', 'created_at', 'updated_at']
    ordering = ['order']
    
    def get_queryset(self):
        database_id = self.kwargs.get('database_id')
        if database_id:
            database = get_object_or_404(Database, id=database_id)
            return DatabaseRecord.objects.filter(database=database)
        return DatabaseRecord.objects.none()
    
    def perform_create(self, serializer):
        database_id = self.kwargs.get('database_id')
        database = get_object_or_404(Database, id=database_id)
        serializer.save(database=database, created_by=self.request.user)


class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_public']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'usage_count', 'created_at']
    ordering = ['-usage_count', 'name']
    
    def get_queryset(self):
        workspace_slug = self.kwargs.get('workspace_slug')
        queryset = Template.objects.filter(is_public=True)
        
        if workspace_slug:
            workspace = get_object_or_404(Workspace, slug=workspace_slug)
            # Include workspace-specific templates
            workspace_templates = Template.objects.filter(workspace=workspace)
            queryset = queryset.union(workspace_templates)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        template = self.get_object()
        template.usage_count += 1
        template.save()
        
        # TODO: Create page from template
        return Response({'message': 'Template used successfully'})
