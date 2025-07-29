from rest_framework import serializers
from .models import MediaFile, MediaFolder, MediaUsage, MediaShare

class MediaFileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaFile
        fields = (
            'id', 'workspace', 'file', 'thumbnail', 'file_type',
            'file_name', 'original_name', 'mime_type', 'size',
            'metadata', 'uploaded_by', 'created_at', 'updated_at',
            'download_url', 'thumbnail_url'
        )
        read_only_fields = (
            'id', 'file_type', 'file_name', 'original_name',
            'mime_type', 'size', 'uploaded_by', 'created_at',
            'updated_at'
        )

    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if request and obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

class MediaFolderSerializer(serializers.ModelSerializer):
    subfolders_count = serializers.SerializerMethodField()
    files_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaFolder
        fields = (
            'id', 'workspace', 'name', 'parent', 'created_by',
            'created_at', 'updated_at', 'subfolders_count',
            'files_count'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def get_subfolders_count(self, obj):
        return obj.subfolders.count()

    def get_files_count(self, obj):
        return MediaFile.objects.filter(
            workspace=obj.workspace,
            metadata__folder_id=str(obj.id)
        ).count()

class MediaUsageSerializer(serializers.ModelSerializer):
    storage_used_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaUsage
        fields = (
            'id', 'workspace', 'storage_used', 'storage_used_formatted',
            'file_count', 'last_updated'
        )
        read_only_fields = ('id', 'last_updated')

    def get_storage_used_formatted(self, obj):
        """Convert bytes to human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if obj.storage_used < 1024:
                return f"{obj.storage_used:.2f} {unit}"
            obj.storage_used /= 1024
        return f"{obj.storage_used:.2f} TB"

class MediaShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaShare
        fields = (
            'id', 'media_file', 'access_token', 'permission',
            'expires_at', 'created_by', 'created_at'
        )
        read_only_fields = ('id', 'access_token', 'created_by', 'created_at')

class MediaUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    folder_id = serializers.UUIDField(required=False, allow_null=True)
    metadata = serializers.JSONField(required=False)