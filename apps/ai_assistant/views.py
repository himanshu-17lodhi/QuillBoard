from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import AIAssistant, Suggestion
from .serializers import SuggestionSerializer
import openai
import json

class AIAssistantViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        openai.api_key = settings.OPENAI_API_KEY
        self.assistant = AIAssistant()

    @action(detail=False, methods=['post'])
    def process(self, request):
        command = request.data.get('command')
        context = request.data.get('context', {})

        if not command:
            return Response(
                {'error': 'Command is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = self.assistant.process_command(command, context)
            return Response(response)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def block_action(self, request):
        action = request.data.get('action')
        block_id = request.data.get('blockId')

        if not action or not block_id:
            return Response(
                {'error': 'Action and blockId are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = self.assistant.process_block_action(action, block_id)
            return Response(response)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def apply_suggestion(self, request, pk=None):
        try:
            suggestion = Suggestion.objects.get(
                id=pk,
                user=request.user
            )
            changes = suggestion.apply()
            return Response({'changes': changes})
        except Suggestion.DoesNotExist:
            return Response(
                {'error': 'Suggestion not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def generate_content(self, request):
        prompt = request.data.get('prompt')
        block_type = request.data.get('blockType', 'text')
        
        if not prompt:
            return Response(
                {'error': 'Prompt is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content = self.assistant.generate_content(prompt, block_type)
            return Response({'content': content})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def improve_writing(self, request):
        content = request.data.get('content')
        style = request.data.get('style', 'professional')
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            improved_content = self.assistant.improve_writing(content, style)
            return Response({'content': improved_content})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def summarize(self, request):
        content = request.data.get('content')
        length = request.data.get('length', 'medium')
        
        if not content:
            return Response(
                {'error': 'Content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            summary = self.assistant.summarize(content, length)
            return Response({'summary': summary})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def translate(self, request):
        content = request.data.get('content')
        target_language = request.data.get('targetLanguage')
        
        if not content or not target_language:
            return Response(
                {'error': 'Content and target language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            translated_content = self.assistant.translate(content, target_language)
            return Response({'content': translated_content})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def get_suggestions(self, request):
        page_id = request.query_params.get('pageId')
        
        if not page_id:
            return Response(
                {'error': 'Page ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        suggestions = Suggestion.objects.filter(
            user=request.user,
            page_id=page_id,
            applied=False
        ).order_by('-created_at')

        serializer = SuggestionSerializer(suggestions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def clear_suggestions(self, request):
        page_id = request.query_params.get('pageId')
        
        if not page_id:
            return Response(
                {'error': 'Page ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Suggestion.objects.filter(
            user=request.user,
            page_id=page_id,
            applied=False
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)