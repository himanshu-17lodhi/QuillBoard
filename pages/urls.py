from django.urls import path
from . import views

app_name = 'pages'

urlpatterns = [
    path('<slug:workspace_slug>/<uuid:page_id>/', views.page_detail, name='detail'),
    path('<slug:workspace_slug>/<uuid:page_id>/edit/', views.page_edit, name='edit'),
    path('<slug:workspace_slug>/create/', views.page_create, name='create'),
    path('<slug:workspace_slug>/templates/', views.template_list, name='templates'),
]