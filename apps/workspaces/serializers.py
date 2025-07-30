from rest_framework import serializers
from .models import Workspace, WorkspaceMember, WorkspaceInvite, WorkspaceSettings

class WorkspaceSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'slug', 'description', 'owner', 'icon',
                 'is_private', 'created_at', 'updated_at', 'member_count',
                 'user_role')
        read_only_fields = ('id', 'slug', 'owner', 'created_at', 'updated_at')

    def get_member_count(self, obj):
        return obj.members.count()

    def get_user_role(self, obj):
        user = self.context['request'].user
        try:
            member = WorkspaceMember.objects.get(workspace=obj, user=user)
            return member.role
        except WorkspaceMember.DoesNotExist:
            return None

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ('id', 'workspace', 'user', 'user_email', 'user_name',
                 'role', 'joined_at', 'invited_by')
        read_only_fields = ('id', 'joined_at', 'invited_by')

class WorkspaceInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceInvite
        fields = ('id', 'workspace', 'email', 'role', 'invited_by',
                 'status', 'created_at', 'expires_at')
        read_only_fields = ('id', 'invited_by', 'status', 'created_at')

    def validate_email(self, value):
        workspace = self.context['workspace']
        if WorkspaceMember.objects.filter(workspace=workspace, user__email=value).exists():
            raise serializers.ValidationError("User is already a member of this workspace")
        if WorkspaceInvite.objects.filter(workspace=workspace, email=value, status='pending').exists():
            raise serializers.ValidationError("An invite is already pending for this email")
        return value

class WorkspaceSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceSettings
        fields = ('id', 'workspace', 'allow_public_pages', 'default_role',
                 'enable_comments', 'enable_tasks', 'custom_domain',
                 'theme_settings', 'created_at', 'updated_at')
        read_only_fields = ('id', 'workspace', 'created_at', 'updated_at')