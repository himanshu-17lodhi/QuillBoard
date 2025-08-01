from rest_framework import serializers
from django.contrib.auth import get_user_model
from workspaces.models import Workspace, WorkspaceMember, WorkspaceInvite
from pages.models import Page, Block, Comment, Template, PagePermission
from databases.models import Database, DatabaseField, DatabaseRecord, DatabaseView, DatabaseRelation

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class WorkspaceSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Workspace
        fields = ['id', 'name', 'description', 'slug', 'icon', 'is_active', 'settings', 
                 'created_at', 'updated_at', 'member_count', 'user_role']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            membership = obj.members.filter(user=request.user, is_active=True).first()
            return membership.role if membership else None
        return None


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'role', 'is_active', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class PageSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    block_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'icon', 'cover_image', 'parent', 'order', 'is_published', 
                 'is_template', 'template_data', 'settings', 'created_at', 'updated_at', 
                 'children', 'block_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        return PageSerializer(obj.children.all(), many=True, context=self.context).data
    
    def get_block_count(self, obj):
        return obj.blocks.filter(is_active=True).count()


class BlockSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Block
        fields = ['id', 'block_type', 'content', 'parent_block', 'order', 'is_active', 
                 'created_at', 'updated_at', 'children']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_children(self, obj):
        return BlockSerializer(obj.children.all(), many=True, context=self.context).data


class CommentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'content_type', 'object_id', 'parent_comment', 
                 'is_resolved', 'created_at', 'updated_at', 'created_by', 'replies']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_replies(self, obj):
        return CommentSerializer(obj.replies.all(), many=True, context=self.context).data


class TemplateSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'icon', 'category', 'template_data', 
                 'is_public', 'usage_count', 'created_at', 'updated_at', 'created_by']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'usage_count']


class DatabaseFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseField
        fields = ['id', 'name', 'field_type', 'options', 'order', 'is_required', 'is_primary', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DatabaseSerializer(serializers.ModelSerializer):
    fields = DatabaseFieldSerializer(many=True, read_only=True)
    record_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Database
        fields = ['id', 'name', 'description', 'icon', 'settings', 'created_at', 'updated_at', 
                 'fields', 'record_count']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_record_count(self, obj):
        return obj.records.count()


class DatabaseRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseRecord
        fields = ['id', 'data', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DatabaseViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseView
        fields = ['id', 'name', 'view_type', 'config', 'filters', 'sorts', 'is_default', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']