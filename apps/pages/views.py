from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Page
from .serializers import PageSerializer, PageDetailSerializer
from apps.blocks.serializers import BlockSerializer

class PageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Page.objects.filter(
            workspace__workspacemember__user=self.request.user
        ).distinct()

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update']:
            return PageDetailSerializer
        return PageSerializer

    @action(detail=True, methods=['get'])
    def blocks(self, request, pk=None):
        page = self.get_object()
        blocks = page.blocks.all()
        serializer = BlockSerializer(blocks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        original_page = self.get_object()
        new_page = Page.objects.create(
            workspace=original_page.workspace,
            title=f"{original_page.title} (Copy)",
            created_by=request.user
        )
        
        # Duplicate blocks
        for block in original_page.blocks.all():
            block.pk = None
            block.page = new_page
            block.created_by = request.user
            block.save()
        
        serializer = self.get_serializer(new_page)
        return Response(serializer.data)