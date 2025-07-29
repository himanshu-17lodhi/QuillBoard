from celery import shared_task
from .models import AIRequest
from .services import AIRequestProcessor
import asyncio

@shared_task
def process_ai_request(request_id):
    try:
        request = AIRequest.objects.get(id=request_id)
        loop = asyncio.get_event_loop()
        loop.run_until_complete(AIRequestProcessor.process_request(request))
    except AIRequest.DoesNotExist:
        pass
    except Exception as e:
        # Log the error and potentially retry the task
        pass

@shared_task
def cleanup_old_requests():
    """
    Cleanup requests older than 30 days
    """
    from django.utils import timezone
    from datetime import timedelta
    
    cutoff_date = timezone.now() - timedelta(days=30)
    AIRequest.objects.filter(created_at__lt=cutoff_date).delete()