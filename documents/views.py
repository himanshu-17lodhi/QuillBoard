from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Document, DocumentPermission, FileUpload
from .serializers import DocumentSerializer
from .permissions import DocumentPermission as CustomDocumentPermission

@login_required
def document_list(request):
    return render(request, 'documents/document_list.html')

@login_required
def editor_page(request, document_id):
    document = get_object_or_404(Document, id=document_id)
    has_permission = DocumentPermission.objects.filter(document=document, user=request.user).exists() or document.owner == request.user
    if not has_permission:
        return render(request, '403.html', status=403)
    return render(request, 'documents/editor_page.html', {'document': document})

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated, CustomDocumentPermission]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(owner=user) | Document.objects.filter(permissions__user=user)

    @action(detail=True, methods=['post'])
    def update_content(self, request, pk=None):
        document = self.get_object()
        content = request.data.get('content')
        if content:
            document.content = content
            document.save()
            from .tasks import save_document_version
            save_document_version.delay(document.id, content, request.user.id)
        return Response({'status': 'content updated'})

    @action(detail=False, methods=['post'])
    def upload(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
        if file.content_type not in ['image/jpeg', 'image/png', 'application/pdf']:
            return Response({'error': 'Invalid file type'}, status=400)
        if file.size > 5242880:  # 5MB
            return Response({'error': 'File too large'}, status=400)
        file_upload = FileUpload.objects.create(
            document=Document.objects.first(),  # Adjust based on context
            file=file,
            uploaded_by=request.user
        )
        return Response({'url': file_upload.file.url, 'filename': file.name})