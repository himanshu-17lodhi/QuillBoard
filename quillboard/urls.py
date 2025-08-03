"""
URL configuration for quillboard project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from core.views import ReactAppView
from core.urls import api_urlpatterns as core_api_urls

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API routes - these must come before the catch-all
    path('api/', include('api.urls')),
    path('api/', include((core_api_urls, 'core'), namespace='core_api')),
    
    # Django template views (for development/backward compatibility)
    path('django/', include('core.urls')),
    path('django/workspaces/', include('workspaces.urls')),
    path('django/pages/', include('pages.urls')),
    path('django/databases/', include('databases.urls')),
    
    # React SPA - catch all other routes (this MUST be last)
    re_path(r'^.*$', ReactAppView.as_view(), name='react_app'),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
