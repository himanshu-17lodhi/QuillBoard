from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.collaboration.models import (
    CollaborationSession,
    CollaborationPresence,
    CollaborationOperation
)
from apps.pages.models import Page
from apps.workspaces.models import Workspace, WorkspaceMember
from channels.testing import WebsocketCommunicator
from notion_clone.asgi import application
from . import create_test_user, get_auth_client

class CollaborationTests(APITestCase):
    def setUp(self):
        self.user = create_test_user()
        self.client = get_auth_client(self.user)
        
        # Create workspace and page
        self.workspace = Workspace.objects.create(
            name='Test Workspace',
            slug='test-workspace'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace,
            user=self.user,
            role='admin'
        )
        
        self.page = Page.objects.create(
            workspace=self.workspace,
            created_by=self.user,
            title='Test Page',
            slug='test-page'
        )

    async def test_websocket_connection(self):
        """Test WebSocket connection"""
        communicator = WebsocketCommunicator(
            application,
            f"/ws/collaboration/{self.page.id}/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    def test_collaboration_session(self):
        """Test collaboration session creation"""
        url = reverse('collaboration-session-list', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug
        })
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CollaborationSession.objects.exists())

    def test_presence_update(self):
        """Test presence updates"""
        session = CollaborationSession.objects.create(page=self.page)
        url = reverse('collaboration-presence-update', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug,
            'session_id': session.id
        })
        
        presence_data = {
            'cursor_position': {'x': 100, 'y': 200},
            'selection_range': {'start': 0, 'end': 10}
        }
        response = self.client.post(url, presence_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(CollaborationPresence.objects.exists())

    def test_operation_handling(self):
        """Test collaborative operations"""
        session = CollaborationSession.objects.create(page=self.page)
        url = reverse('collaboration-operation-list', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug,
            'session_id': session.id
        })
        
        operation_data = {
            'operation_type': 'insert',
            'block_id': str(self.page.blocks.first().id),
            'data': {'text': 'New content'},
            'version': 1
        }
        response = self.client.post(url, operation_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CollaborationOperation.objects.exists())