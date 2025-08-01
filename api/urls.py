from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

app_name = 'api'

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'workspaces', views.WorkspaceViewSet, basename='workspace')
router.register(r'templates', views.TemplateViewSet, basename='template')

# Nested routes for workspace-specific resources
workspace_router = DefaultRouter()
workspace_router.register(r'pages', views.PageViewSet, basename='workspace-page')
workspace_router.register(r'databases', views.DatabaseViewSet, basename='workspace-database')
workspace_router.register(r'templates', views.TemplateViewSet, basename='workspace-template')

# Nested routes for page-specific resources
page_router = DefaultRouter()
page_router.register(r'blocks', views.BlockViewSet, basename='page-block')

# Nested routes for database-specific resources
database_router = DefaultRouter()
database_router.register(r'records', views.DatabaseRecordViewSet, basename='database-record')

urlpatterns = [
    # Authentication
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    
    # Main API routes
    path('', include(router.urls)),
    
    # Workspace-specific routes
    path('workspaces/<slug:workspace_slug>/', include(workspace_router.urls)),
    
    # Page-specific routes
    path('pages/<uuid:page_id>/', include(page_router.urls)),
    
    # Database-specific routes
    path('databases/<uuid:database_id>/', include(database_router.urls)),
]