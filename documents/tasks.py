from celery import shared_task
from .models import Document, DocumentVersion
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def autosave_document(document_id, content, user_id):
    document = Document.objects.get(id=document_id)
    document.content = content
    document.save()

@shared_task
def save_document_version(document_id, content, user_id):
    document = Document.objects.get(id=document_id)
    version_count = DocumentVersion.objects.filter(document=document).count()
    DocumentVersion.objects.create(
        document=document,
        version_number=version_count + 1,
        content=content,
        user=User.objects.get(id=user_id)
    )