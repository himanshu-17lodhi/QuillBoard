from django.urls import path
from . import views

app_name = 'workspaces'

urlpatterns = [
    path('', views.workspace_list, name='list'),
    path('create/', views.workspace_create, name='create'),
    path('<slug:slug>/', views.workspace_detail, name='detail'),
    path('<slug:slug>/settings/', views.workspace_settings, name='settings'),
    path('<slug:slug>/members/', views.workspace_members, name='members'),
    path('<slug:slug>/invite/', views.workspace_invite, name='invite'),
]