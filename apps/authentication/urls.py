from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView,
    UserProfileView,
    LogoutView,
    ChangePasswordView,
    UpdateProfileView,
    UserProfileSettingsView,
)

app_name = 'authentication'

urlpatterns = [
    # JWT Token URLs
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Authentication URLs
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Profile URLs
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='profile-update'),
    path('profile/settings/', UserProfileSettingsView.as_view(), name='profile-settings'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
]