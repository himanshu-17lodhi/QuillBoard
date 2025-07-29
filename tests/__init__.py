from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

def create_test_user(email='test@example.com', password='testpass123'):
    """Helper function to create a test user"""
    return User.objects.create_user(
        email=email,
        password=password,
        first_name='Test',
        last_name='User'
    )

def get_auth_client(user):
    """Helper function to get an authenticated API client"""
    client = APIClient()
    client.force_authenticate(user=user)
    return client