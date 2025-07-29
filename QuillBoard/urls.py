from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/workspaces/', include('apps.workspaces.urls')),
    path('api/pages/', include('apps.pages.urls')),
    path('api/blocks/', include('apps.blocks.urls')),
    path('api/collaboration/', include('apps.collaboration.urls')),
    path('api/ai/', include('apps.ai_assistant.urls')),
    path('api/media/', include('apps.media_manager.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/templates/', include('apps.templates.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [path('__debug__/', include('debug_toolbar.urls'))]