from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Block, BlockAttachment, BlockVersion
from .serializers import (
    BlockSerializer,
    BlockAttachmentSerializer,
    BlockVersionSerializer,
    BlockMoveSerializer,
    BlockBulkUpdateSerializer
)
from apps.workspaces.permissions import IsWorkspaceMember, CanEditWorkspace

class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return Block.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug'],
            page__slug=self.kwargs['page_slug']
        ).prefetch_related('children')

    def perform_create(self, serializer):
        page = get_object_or_404(
            Page,
            workspace__slug=self.kwargs['workspace_slug'],
            slug=self.kwargs['page_slug']
        )
        serializer.save(
            page=page,
            created_by=self.request.user,
            last_edited_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(last_edited_by=self.request.user)

    @action(detail=True, methods=['post'])
    def move(self, request, workspace_slug=None, page_slug=None, pk=None):
        block = self.get_object()
        serializer = BlockMoveSerializer(data=request.data)
        
        if serializer.is_valid():
            target_page_id = serializer.validated_data.get('target_page_id')
            target_parent_id = serializer.validated_data.get('target_parent_id')
            order = serializer.validated_data.get('order')
            
            if target_page_id:
                block.page_id = target_page_id
            if target_parent_id is not None:
                block.parent_id = target_parent_id
            block.order = order
            block.save()
            
            return Response(BlockSerializer(block).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def bulk_update(self, request, workspace_slug=None, page_slug=None):
        serializer = BlockBulkUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            blocks_data = serializer.validated_data['blocks']
            updated_blocks = []
            
            for block_data in blocks_data:
                block_id = block_data.pop('id')
                block = get_object_or_404(Block, id=block_id)
                for key, value in block_data.items():
                    setattr(block, key, value)
                block.last_edited_by = request.user
                block.save()
                updated_blocks.append(block)
            
            return Response(
                BlockSerializer(updated_blocks, many=True).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlockAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = BlockAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditWorkspace]

    def get_queryset(self):
        return BlockAttachment.objects.filter(
            block__page__workspace__slug=self.kwargs['workspace_slug'],
            block__page__slug=self.kwargs['page_slug'],
            block_id=self.kwargs['block_pk']
        )

    def perform_create(self, serializer):
        block = get_object_or_404(Block, id=self.kwargs['block_pk'])
        serializer.save(block=block, uploaded_by=self.request.user)

class BlockVersionViewSet(viewsets.ModelViewSet):
    serializer_class = BlockVersionSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return BlockVersion.objects.filter(
            block__page__workspace__slug=self.kwargs['workspace_slug'],
            block__page__slug=self.kwargs['page_slug'],
            block_id=self.kwargs['block_pk']
        )

    def perform_create(self, serializer):
        block = get_object_or_404(Block, id=self.kwargs['block_pk'])
        serializer.save(block=block, created_by=self.request.user)