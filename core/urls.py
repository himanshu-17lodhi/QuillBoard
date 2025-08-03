from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

app_name = 'core'

# Traditional template-based URLs
template_urlpatterns = [
    path('', views.home, name='home'),
    path('login/', auth_views.LoginView.as_view(template_name='core/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile, name='profile'),
    path('profile/<int:pk>/', views.profile_detail, name='profile_detail'),
]

# API URLs for React frontend
api_urlpatterns = [
    path('auth/login/', views.api_login, name='api_login'),
    path('auth/logout/', views.api_logout, name='api_logout'),
    path('auth/register/', views.api_register, name='api_register'),
    path('auth/user/', views.api_user_info, name='api_user_info'),
]

# Default to template URLs (will be overridden in main urls.py for API routes)
urlpatterns = template_urlpatterns