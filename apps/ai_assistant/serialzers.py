from rest_framework import serializers
from .models import AIModel, AIRequest, AIAssistantContext, AIUsageMetrics

class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = ('id', 'name', 'provider', 'model_identifier', 'is_active',
                 'configuration', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class AIRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRequest
        fields = ('id', 'user', 'model', 'request_type', 'input_data',
                 'output_data', 'status', 'error_message', 'created_at',
                 'completed_at')
        read_only_fields = ('id', 'user', 'output_data', 'status',
                          'error_message', 'created_at', 'completed_at')

class AIAssistantContextSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistantContext
        fields = ('id', 'page', 'block', 'context_type', 'context_data',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class AIUsageMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIUsageMetrics
        fields = ('id', 'user', 'model', 'request_type', 'tokens_used',
                 'cost', 'date')
        read_only_fields = ('id', 'date')

class AIRequestInputSerializer(serializers.Serializer):
    model_id = serializers.UUIDField()
    request_type = serializers.ChoiceField(choices=AIRequest.REQUEST_TYPES)
    text = serializers.CharField()
    options = serializers.JSONField(required=False)