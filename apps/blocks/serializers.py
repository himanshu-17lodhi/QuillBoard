from rest_framework import serializers
from .models import Block, BlockAttachment, BlockVersion

class BlockSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Block
        fields = (
            'id', 'page', 'type', 'content', 'parent', 'order',
            'created_by', 'last_edited_by', 'created_at', 'updated_at',
            'children'
        )
        read_only_fields = (
            'id', 'created_by', 'last_edited_by', 'created_at', 'updated_at'
        )

    def get_children(self, obj):
        children = obj.children.all()
        return BlockSerializer(children, many=True).data

class BlockAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockAttachment
        fields = (
            'id', 'block', 'file', 'filename', 'file_type',
            'file_size', 'uploaded_by', 'created_at'
        )
        read_only_fields = ('id', 'uploaded_by', 'created_at')

class BlockVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockVersion
        fields = (
            'id', 'block', 'content', 'created_by', 'created_at'
        )
        read_only_fields = ('id', 'created_by', 'created_at')

class BlockMoveSerializer(serializers.Serializer):
    target_page_id = serializers.UUIDField(required=False)
    target_parent_id = serializers.UUIDField(required=False, allow_null=True)
    order = serializers.FloatField(required=True)

class BlockBulkUpdateSerializer(serializers.Serializer):
    blocks = serializers.ListField(
        child=serializers.DictField()
    )