import openai
from django.conf import settings
from .models import AIModel, AIRequest, AIUsageMetrics
from datetime import datetime
import asyncio
import logging

logger = logging.getLogger(__name__)

class BaseAIService:
    def __init__(self, model: AIModel):
        self.model = model
        self.config = model.configuration

    async def process_request(self, request: AIRequest) -> dict:
        raise NotImplementedError

    def update_usage_metrics(self, request: AIRequest, tokens_used: int, cost: float):
        AIUsageMetrics.objects.create(
            user=request.user,
            model=self.model,
            request_type=request.request_type,
            tokens_used=tokens_used,
            cost=cost
        )

class OpenAIService(BaseAIService):
    def __init__(self, model: AIModel):
        super().__init__(model)
        openai.api_key = settings.OPENAI_API_KEY

    async def process_request(self, request: AIRequest) -> dict:
        try:
            prompt = self._build_prompt(request)
            response = await openai.ChatCompletion.acreate(
                model=self.model.model_identifier,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.get('temperature', 0.7),
                max_tokens=self.config.get('max_tokens', 1000)
            )
            
            usage = response.usage
            self.update_usage_metrics(
                request,
                usage.total_tokens,
                (usage.total_tokens / 1000) * self.config.get('cost_per_1k_tokens', 0)
            )
            
            return {
                'content': response.choices[0].message.content,
                'usage': usage._asdict()
            }
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise

    def _build_prompt(self, request: AIRequest) -> str:
        input_data = request.input_data
        request_type = request.request_type
        
        prompts = {
            'summarize': "Please summarize the following text:\n\n",
            'rewrite': "Please rewrite the following text:\n\n",
            'generate': "Please generate content based on this prompt:\n\n",
            'explain': "Please explain the following:\n\n",
            'translate': f"Please translate the following text to {input_data.get('target_language', 'English')}:\n\n",
            'analyze': "Please analyze the following text:\n\n"
        }
        
        base_prompt = prompts.get(request_type, "")
        return base_prompt + input_data.get('text', '')

class AIServiceFactory:
    @staticmethod
    def get_service(model: AIModel) -> BaseAIService:
        if model.provider == 'openai':
            return OpenAIService(model)
        # Add other AI service providers here
        raise ValueError(f"Unsupported AI provider: {model.provider}")

class AIRequestProcessor:
    @staticmethod
    async def process_request(request: AIRequest):
        try:
            request.status = 'processing'
            request.save()

            service = AIServiceFactory.get_service(request.model)
            result = await service.process_request(request)

            request.status = 'completed'
            request.output_data = result
            request.completed_at = datetime.now()
            request.save()

        except Exception as e:
            request.status = 'failed'
            request.error_message = str(e)
            request.save()
            raise