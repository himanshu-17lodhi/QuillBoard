from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.pages.models import Page
from apps.workspaces.models import Workspace, WorkspaceMember
from . import create_test_user, get_auth_client

class PageTests(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.client = get_auth_client(self.user)
        
        # Create workspace
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            slug='test-workspace'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
        
        self.page_data = {
            'title': 'Test Page',
            'slug': 'test-page',
            'content': {'blocks': []}
        }

    def test_create_page(self):
        """Test page creation"""
        url = reverse('page-list', kwargs={'workspace_slug': self.workspace.slug})
        response = self.client.post(url, self.page_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Page.objects.count(), 1)

    def test_update_page(self):
        """Test page update"""
        page = Page.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            **self.page_data
        )
        
        url = reverse('page-detail', kwargs={
            'workspace_slug': self.workspace.slug,
            'slug': page.slug
        })
        updated_data = {
            'title': 'Updated Page',
            'content': {'blocks': [{'type': 'text', 'data': {'text': 'Hello'}}]}
        }
        response = self.client.patch(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        page.refresh_from_db()
        self.assertEqual(page.title, 'Updated Page')

    def test_page_permissions(self):
        """Test page permission checks"""
        page = Page.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            **self.page_data
        )
        
        # Create another user without access
        other_user = create_test_user(
            email='other@example.com',
            password='testpass123'
        )
        other_client = get_auth_client(other_user)
        
        url = reverse('page-detail', kwargs={
            'workspace_slug': self.workspace.slug,
            'slug': page.slug
        })
        response = other_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_page_version_history(self):
        """Test page version history"""
        page = Page.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            **self.page_data
        )
        
        url = reverse('page-versions', kwargs={
            'workspace_slug': self.workspace.slug,
            'slug': page.slug
        })
        
        # Make some changes
        updates = [
            {'content': {'blocks': [{'type': 'text', 'data': {'text': 'Version 1'}}]}},
            {'content': {'blocks': [{'type': 'text', 'data': {'text': 'Version 2'}}]}}
        ]
        
        for update in updates:
            response = self.client.post(url, update)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Get version history
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)