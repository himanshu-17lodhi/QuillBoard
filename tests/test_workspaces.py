from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.workspaces.models import Workspace, WorkspaceMember
from . import create_test_user, get_auth_client

class WorkspaceTests(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.client = get_auth_client(self.user)
        self.workspace_data = {
            'name': 'Test Workspace',
            'slug': 'test-workspace',
            'description': 'Test workspace description'
        }

    def test_create_workspace(self):
        """Test workspace creation"""
        url = reverse('workspace-list')
        response = self.client.post(url, self.workspace_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Workspace.objects.count(), 1)
        self.assertEqual(WorkspaceMember.objects.count(), 1)

    def test_update_workspace(self):
        """Test workspace update"""
        workspace = Workspace.objects.create(**self.workspace_data)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.user,
            role='admin'
        )
        
        url = reverse('workspace-detail', kwargs={'slug': workspace.slug})
        updated_data = {
            'name': 'Updated Workspace',
            'description': 'Updated description'
        }
        response = self.client.patch(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workspace.refresh_from_db()
        self.assertEqual(workspace.name, 'Updated Workspace')

    def test_workspace_members(self):
        """Test workspace member management"""
        workspace = Workspace.objects.create(**self.workspace_data)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.user,
            role='admin'
        )
        
        # Create another user to invite
        other_user = create_test_user(
            email='other@example.com',
            password='testpass123'
        )
        
        # Invite member
        url = reverse('workspace-members', kwargs={'slug': workspace.slug})
        response = self.client.post(url, {
            'email': other_user.email,
            'role': 'member'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkspaceMember.objects.count(), 2)

    def test_workspace_settings(self):
        """Test workspace settings update"""
        workspace = Workspace.objects.create(**self.workspace_data)
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=self.user,
            role='admin'
        )
        
        url = reverse('workspace-settings', kwargs={'slug': workspace.slug})
        settings_data = {
            'icon': '📚',
            'theme': 'dark',
            'default_page_template': 'blank'
        }
        response = self.client.patch(url, settings_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        workspace.refresh_from_db()
        self.assertEqual(workspace.icon, '📚')