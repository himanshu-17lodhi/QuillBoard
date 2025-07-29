from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from asgiref.sync import async_to_sync
from .models import AIModel, AIRequest, AIAssistantContext, AIUsageMetrics
from .serializers import (
    AIModelSerializer,
    AIRequestSerializer,
    AIAssistantContextSerializer,
    AIUsageMetricsSerializer,
    AIRequestInputSerializer
)
from .services import AIRequestProcessor
from apps.workspaces.permissions import IsWorkspaceMember

class AIModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIModel.objects.filter(is_active=True)
    serializer_class = AIModelSerializer
    permission_classes = [permissions.IsAuthenticated]

class AIRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AIRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return AIRequest.objects.filter(
            user=self.request.user
        ).select_related('model')

    @action(detail=False, methods=['post'])
    def process(self, request):
        input_serializer = AIRequestInputSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = input_serializer.validated_data
        model = get_object_or_404(AIModel, id=validated_data['model_id'])

        ai_request = AIRequest.objects.create(
            user=request.user,
            model=model,
            request_type=validated_data['request_type'],
            input_data={
                'text': validated_data['text'],
                'options': validated_data.get('options', {})
            }
        )

        try:
            async_to_sync(AIRequestProcessor.process_request)(ai_request)
            return Response(AIRequestSerializer(ai_request).data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AIAssistantContextViewSet(viewsets.ModelViewSet):
    serializer_class = AIAssistantContextSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        return AIAssistantContext.objects.filter(
            page__workspace__slug=self.kwargs['workspace_slug']
        )

class AIUsageMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AIUsageMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIUsageMetrics.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        metrics = self.get_queryset()
        summary = {
            'total_tokens': sum(m.tokens_used for m in metrics),
            'total_cost': sum(m.cost for m in metrics),
            'requests_by_type': {}
        }
        
        for request_type in dict(AIRequest.REQUEST_TYPES).keys():
            type_metrics = metrics.filter(request_type=request_type)
            summary['requests_by_type'][request_type] = {
                'count': type_metrics.count(),
                'tokens': sum(m.tokens_used for m in type_metrics),
                'cost': sum(m.cost for m in type_metrics)
            }
        
        return Response(summary)