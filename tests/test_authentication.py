from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from apps.authentication.models import EmailVerification
from datetime import datetime, timedelta
from . import create_test_user, get_auth_client

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())

    def test_user_login(self):
        """Test user login endpoint"""
        user = create_test_user()
        response = self.client.post(self.login_url, {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_email_verification(self):
        """Test email verification process"""
        user = create_test_user()
        verification = EmailVerification.objects.create(user=user)
        verify_url = reverse('verify-email', kwargs={'token': verification.token})
        
        response = self.client.get(verify_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_password_reset(self):
        """Test password reset process"""
        user = create_test_user()
        reset_url = reverse('password-reset')
        
        # Request password reset
        response = self.client.post(reset_url, {'email': user.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Get reset token from verification
        verification = EmailVerification.objects.get(user=user, type='password_reset')
        
        # Reset password
        reset_confirm_url = reverse('password-reset-confirm')
        response = self.client.post(reset_confirm_url, {
            'token': verification.token,
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try login with new password
        response = self.client.post(self.login_url, {
            'email': user.email,
            'password': 'newpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class TokenTests(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.client = get_auth_client(self.user)
        self.refresh_url = reverse('token-refresh')

    def test_token_refresh(self):
        """Test token refresh endpoint"""
        # First get tokens through login
        response = self.client.post(reverse('login'), {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        refresh_token = response.data['refresh']
        
        # Try refreshing access token
        response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)