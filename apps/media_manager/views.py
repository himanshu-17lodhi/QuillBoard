from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import MediaFile, MediaFolder, MediaUsage, MediaShare
from .serializers import (
    MediaFileSerializer,
    MediaFolderSerializer,
    MediaUsageSerializer,
    MediaShareSerializer,
    MediaUploadSerializer
)
from .utils import MediaProcessor
from apps.workspaces.permissions import IsWorkspaceMember, CanEditWorkspace
import mimetypes
import uuid

class MediaFileViewSet(viewsets.ModelViewSet):
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return MediaFile.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )

    def perform_create(self, serializer):
        workspace = get_object_or_404(
            Workspace,
            slug=self.kwargs['workspace_slug']
        )
        
        upload_serializer = MediaUploadSerializer(data=self.request.data)
        upload_serializer.is_valid(raise_exception=True)
        
        uploaded_file = upload_serializer.validated_data['file']
        folder_id = upload_serializer.validated_data.get('folder_id')
        metadata = upload_serializer.validated_data.get('metadata', {})
        
        if folder_id:
            metadata['folder_id'] = str(folder_id)

        # Process the uploaded file
        processor = MediaProcessor(uploaded_file)
        processed_file = processor.process()
        
        serializer.save(
            workspace=workspace,
            uploaded_by=self.request.user,
            file=processed_file['file'],
            thumbnail=processed_file.get('thumbnail'),
            file_type=processor.get_file_type(),
            file_name=str(uuid.uuid4()) + processor.get_extension(),
            original_name=uploaded_file.name,
            mime_type=mimetypes.guess_type(uploaded_file.name)[0],
            size=uploaded_file.size,
            metadata=metadata
        )

    @action(detail=True, methods=['post'])
    def generate_share_link(self, request, workspace_slug=None, pk=None):
        media_file = self.get_object()
        expires_in = request.data.get('expires_in')  # In hours
        permission = request.data.get('permission', 'view')
        
        expires_at = None
        if expires_in:
            expires_at = timezone.now() + timezone.timedelta(hours=int(expires_in))
        
        share = MediaShare.objects.create(
            media_file=media_file,
            access_token=str(uuid.uuid4()),
            permission=permission,
            expires_at=expires_at,
            created_by=request.user
        )
        
        return Response(MediaShareSerializer(share).data)

class MediaFolderViewSet(viewsets.ModelViewSet):
    serializer_class = MediaFolderSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return MediaFolder.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )

    def perform_create(self, serializer):
        workspace = get_object_or_404(
            Workspace,
            slug=self.kwargs['workspace_slug']
        )
        serializer.save(workspace=workspace, created_by=self.request.user)

class MediaUsageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MediaUsageSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return MediaUsage.objects.filter(
            workspace__slug=self.kwargs['workspace_slug']
        )

    @action(detail=False, methods=['post'])
    def recalculate(self, request, workspace_slug=None):
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        
        total_size = sum(
            f.size for f in MediaFile.objects.filter(workspace=workspace)
        )
        file_count = MediaFile.objects.filter(workspace=workspace).count()
        
        usage, _ = MediaUsage.objects.update_or_create(
            workspace=workspace,
            defaults={
                'storage_used': total_size,
                'file_count': file_count
            }
        )
        
        return Response(MediaUsageSerializer(usage).data)

class MediaShareViewSet(viewsets.ModelViewSet):
    serializer_class = MediaShareSerializer
    permission_classes = [permissions.IsAuthenticated, CanEditWorkspace]

    def get_queryset(self):
        return MediaShare.objects.filter(
            media_file__workspace__slug=self.kwargs['workspace_slug']
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)