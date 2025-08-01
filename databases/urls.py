from django.urls import path
from . import views

app_name = 'databases'

urlpatterns = [
    path('<slug:workspace_slug>/<uuid:database_id>/', views.database_detail, name='detail'),
    path('<slug:workspace_slug>/<uuid:database_id>/view/<uuid:view_id>/', views.database_view, name='view'),
    path('<slug:workspace_slug>/create/', views.database_create, name='create'),
]