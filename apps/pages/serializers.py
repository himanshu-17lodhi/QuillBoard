from rest_framework import serializers
from .models import Page, PageVersion, PageShare, PageComment

class RecursivePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('id', 'title', 'slug', 'icon', 'children')

    children = serializers.SerializerMethodField()

    def get_children(self, obj):
        children = obj.children.filter(is_archived=False)
        return RecursivePageSerializer(children, many=True).data


class PageSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Page
        fields = (
            'id', 'workspace', 'title', 'slug', 'icon', 'parent',
            'creator', 'creator_name', 'last_editor', 'is_template',
            'is_public', 'is_archived', 'created_at', 'updated_at',
            'last_accessed', 'children', 'is_favorited', 'can_edit'
        )
        read_only_fields = ('id', 'slug', 'creator', 'last_editor', 'created_at')

    def get_children(self, obj):
        children = obj.children.filter(is_archived=False)
        return RecursivePageSerializer(children, many=True).data

    def get_creator_name(self, obj):
        return obj.creator.get_full_name() if obj.creator else None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_favorite.filter(id=request.user.id).exists()
        return False

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.workspace.members.filter(
            workspacemember__user=request.user,
            workspacemember__role__in=['admin', 'editor']
        ).exists()


class PageVersionSerializer(serializers.ModelSerializer):
    editor_name = serializers.SerializerMethodField()

    class Meta:
        model = PageVersion
        fields = (
            'id', 'page', 'editor', 'editor_name',
            'content', 'created_at', 'comment'
        )
        read_only_fields = ('id', 'editor', 'created_at')

    def get_editor_name(self, obj):
        return obj.editor.get_full_name() if obj.editor else None


class PageShareSerializer(serializers.ModelSerializer):
    shared_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PageShare
        fields = (
            'id', 'page', 'shared_by', 'shared_by_name',
            'permission', 'access_code', 'expires_at', 'created_at'
        )
        read_only_fields = ('id', 'shared_by', 'created_at')

    def get_shared_by_name(self, obj):
        return obj.shared_by.get_full_name()


class PageCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = PageComment
        fields = (
            'id', 'page', 'user', 'user_name', 'content', 'block_id',
            'parent', 'created_at', 'updated_at', 'is_resolved', 'replies'
        )
        read_only_fields = ('id', 'user', 'created_at')

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_replies(self, obj):
        replies = obj.replies.all().order_by('created_at')
        return PageCommentSerializer(replies, many=True).data
