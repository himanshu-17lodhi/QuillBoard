from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Block
from .serializers import BlockSerializer
from apps.workspaces.models import WorkspaceMember
from apps.pages.models import Page

class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Block.objects.filter(
            page__workspace__workspacemember__user=self.request.user
        ).distinct()

    # def get_serializer_class(self):
    #     if self.action in ['retrieve', 'create', 'update']:
    #         return BlockDetailSerializer
    #     return BlockSerializer

    def perform_create(self, serializer):
        page = get_object_or_404(Page, id=self.request.data.get('page'))
        # Check if user has permission to edit the page
        WorkspaceMember.objects.get(
            workspace=page.workspace,
            user=self.request.user,
            role__in=['admin', 'editor']
        )
        serializer.save(created_by=self.request.user, page=page)

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        block = self.get_object()
        new_position = request.data.get('position')
        
        if new_position is None:
            return Response(
                {'error': 'Position is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            block.move_to(new_position)
            return Response(self.get_serializer(block).data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        original_block = self.get_object()
        new_block = Block.objects.create(
            page=original_block.page,
            type=original_block.type,
            content=original_block.content,
            created_by=request.user,
            position=original_block.position + 1
        )
        
        # Shift subsequent blocks
        Block.objects.filter(
            page=original_block.page,
            position__gt=original_block.position
        ).exclude(id=new_block.id).update(position=F('position') + 1)
        
        return Response(self.get_serializer(new_block).data)

    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        block = self.get_object()
        new_type = request.data.get('type')
        
        if not new_type:
            return Response(
                {'error': 'New block type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            block.convert_to(new_type)
            return Response(self.get_serializer(block).data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def upload_attachment(self, request, pk=None):
        block = self.get_object()
        
        if not request.FILES.get('file'):
            return Response(
                {'error': 'File is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            attachment = block.add_attachment(
                file=request.FILES['file'],
                user=request.user
            )
            return Response({
                'url': attachment.file.url,
                'filename': attachment.filename,
                'content_type': attachment.content_type
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def version_history(self, request, pk=None):
        block = self.get_object()
        versions = block.version_set.all().order_by('-created_at')
        return Response([{
            'id': version.id,
            'content': version.content,
            'created_at': version.created_at,
            'created_by': {
                'id': version.created_by.id,
                'email': version.created_by.email,
                'name': version.created_by.get_full_name()
            }
        } for version in versions])

    @action(detail=True, methods=['post'])
    def restore_version(self, request, pk=None):
        block = self.get_object()
        version_id = request.data.get('version_id')
        
        if not version_id:
            return Response(
                {'error': 'Version ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            block.restore_version(version_id, request.user)
            return Response(self.get_serializer(block).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
