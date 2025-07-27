from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'documents', views.DocumentViewSet)

app_name = 'documents'

urlpatterns = [
    path('', views.document_list, name='document_list'),
    path('editor/<int:document_id>/', views.editor_page, name='editor_page'),
    path('api/', include(router.urls)),
]