from rest_framework import serializers
from .models import (
    Template,
    TemplateCategory,
    TemplateVersion,
    TemplateCategorization
)

class TemplateCategorySerializer(serializers.ModelSerializer):
    template_count = serializers.SerializerMethodField()

    class Meta:
        model = TemplateCategory
        fields = (
            'id', 'workspace', 'name', 'description', 'icon',
            'created_at', 'updated_at', 'template_count'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_template_count(self, obj):
        return obj.templates.count()

class TemplateVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TemplateVersion
        fields = (
            'id', 'template', 'content', 'version_number',
            'created_by', 'created_by_name', 'created_at', 'comment'
        )
        read_only_fields = (
            'id', 'created_by', 'created_by_name', 'created_at'
        )

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

class TemplateSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()
    current_version = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = (
            'id', 'workspace', 'name', 'description', 'type',
            'content', 'icon', 'creator', 'creator_name',
            'is_public', 'times_used', 'created_at', 'updated_at',
            'categories', 'current_version'
        )
        read_only_fields = (
            'id', 'creator', 'times_used', 'created_at', 'updated_at'
        )

    def get_categories(self, obj):
        return TemplateCategorySerializer(
            obj.categorizations.all().select_related('category'),
            many=True
        ).data

    def get_creator_name(self, obj):
        return obj.creator.get_full_name() if obj.creator else None

    def get_current_version(self, obj):
        latest_version = obj.versions.first()
        if latest_version:
            return TemplateVersionSerializer(latest_version).data
        return None

class TemplateCategorizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemplateCategorization
        fields = ('id', 'template', 'category', 'created_at')
        read_only_fields = ('id', 'created_at')

class TemplateCreateSerializer(serializers.ModelSerializer):
    category_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Template
        fields = (
            'id', 'workspace', 'name', 'description', 'type',
            'content', 'icon', 'is_public', 'category_ids'
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        category_ids = validated_data.pop('category_ids', [])
        template = super().create(validated_data)
        
        # Create categorizations
        categories = TemplateCategory.objects.filter(
            id__in=category_ids,
            workspace=template.workspace
        )
        for category in categories:
            TemplateCategorization.objects.create(
                template=template,
                category=category
            )
        
        # Create initial version
        TemplateVersion.objects.create(
            template=template,
            content=validated_data['content'],
            version_number=1,
            created_by=validated_data['creator']
        )
        
        return template