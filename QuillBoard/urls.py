from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

api_patterns = [
    path('auth/', include('apps.authentication.urls')),
    path('', include('apps.workspaces.urls')),
    path('', include('apps.pages.urls')),
    path('', include('apps.blocks.urls')),
    path('', include('apps.collaboration.urls')),
    path('', include('apps.ai_assistant.urls')),
    path('', include('apps.media_manager.urls')),
    path('', include('apps.notifications.urls')),
    path('', include('apps.templates.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_patterns)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]