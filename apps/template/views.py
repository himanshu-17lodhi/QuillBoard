from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F
from .models import (
    Template,
    TemplateCategory,
    TemplateVersion,
    TemplateCategorization
)
from .serializers import (
    TemplateSerializer,
    TemplateCategorySerializer,
    TemplateVersionSerializer,
    TemplateCategorizationSerializer,
    TemplateCreateSerializer
)
from apps.workspaces.permissions import IsWorkspaceMember, CanEditWorkspace

class TemplateCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return TemplateCategory.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )

    def perform_create(self, serializer):
        workspace = get_object_or_404(
            Workspace,
            slug=self.kwargs['workspace_slug']
        )
        serializer.save(workspace=workspace)

class TemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        queryset = Template.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )
        
        # Filter by type if specified
        template_type = self.request.query_params.get('type')
        if template_type:
            queryset = queryset.filter(type=template_type)
        
        # Filter by category if specified
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(categorizations__category_id=category_id)
        
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return TemplateCreateSerializer
        return TemplateSerializer

    def perform_create(self, serializer):
        workspace = get_object_or_404(
            Workspace,
            slug=self.kwargs['workspace_slug']
        )
        serializer.save(
            workspace=workspace,
            creator=self.request.user
        )

    @action(detail=True, methods=['post'])
    def duplicate(self, request, workspace_slug=None, pk=None):
        template = self.get_object()
        new_template = Template.objects.create(
            workspace=template.workspace,
            name=f"{template.name} (Copy)",
            description=template.description,
            type=template.type,
            content=template.content,
            icon=template.icon,
            creator=request.user,
            is_public=False
        )
        
        # Copy categories
        for categorization in template.categorizations.all():
            TemplateCategorization.objects.create(
                template=new_template,
                category=categorization.category
            )
        
        # Create initial version
        TemplateVersion.objects.create(
            template=new_template,
            content=template.content,
            version_number=1,
            created_by=request.user,
            comment="Duplicated from template: " + str(template.id)
        )
        
        return Response(TemplateSerializer(new_template).data)

    @action(detail=True, methods=['post'])
    def use(self, request, workspace_slug=None, pk=None):
        template = self.get_object()
        template.times_used = F('times_used') + 1
        template.save()
        return Response({'status': 'success'})

class TemplateVersionViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateVersionSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditWorkspace]

    def get_queryset(self):
        return TemplateVersion.objects.filter(
            template__workspace__slug=self.kwargs['workspace_slug'],
            template_id=self.kwargs['template_pk']
        )

    def perform_create(self, serializer):
        template = get_object_or_404(
            Template,
            id=self.kwargs['template_pk']
        )
        
        # Get the next version number
        latest_version = template.versions.first()
        next_version = 1 if not latest_version else latest_version.version_number + 1
        
        serializer.save(
            template=template,
            version_number=next_version,
            created_by=self.request.user
        )
        
        # Update template content
        template.content = serializer.validated_data['content']
        template.save()

class TemplateCategorizationViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateCategorizationSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditWorkspace]

    def get_queryset(self):
        return TemplateCategorization.objects.filter(
            template__workspace__slug=self.kwargs['workspace_slug'],
            template_id=self.kwargs['template_pk']
        )

    def perform_create(self, serializer):
        template = get_object_or_404(
            Template,
            id=self.kwargs['template_pk']
        )
        serializer.save(template=template)