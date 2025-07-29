from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.blocks.models import Block
from apps.pages.models import Page
from apps.workspaces.models import Workspace, WorkspaceMember
from . import create_test_user, get_auth_client

class BlockTests(APITestCase):
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
        
        self.block_data = {
            'type': 'text',
            'content': {
                'text': 'Test content'
            },
            'order': 1.0
        }

    def test_create_block(self):
        """Test block creation"""
        url = reverse('block-list', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug
        })
        response = self.client.post(url, self.block_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Block.objects.count(), 1)

    def test_update_block(self):
        """Test block update"""
        block = Block.objects.create(
            page=self.page,
            created_by=self.user,
            **self.block_data
        )
        
        url = reverse('block-detail', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug,
            'pk': block.id
        })
        updated_data = {
            'content': {
                'text': 'Updated content'
            }
        }
        response = self.client.patch(url, updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        block.refresh_from_db()
        self.assertEqual(block.content['text'], 'Updated content')

    def test_block_ordering(self):
        """Test block ordering"""
        blocks = [
            Block.objects.create(
                page=self.page,
                created_by=self.user,
                type='text',
                content={'text': f'Block {i}'},
                order=float(i)
            ) for i in range(1, 4)
        ]
        
        url = reverse('block-reorder', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug
        })
        reorder_data = {
            'blocks': [
                {'id': str(blocks[2].id), 'order': 1.0},
                {'id': str(blocks[0].id), 'order': 2.0},
                {'id': str(blocks[1].id), 'order': 3.0}
            ]
        }
        response = self.client.post(url, reorder_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check new order
        blocks[2].refresh_from_db()
        blocks[0].refresh_from_db()
        blocks[1].refresh_from_db()
        self.assertEqual(blocks[2].order, 1.0)
        self.assertEqual(blocks[0].order, 2.0)
        self.assertEqual(blocks[1].order, 3.0)

    def test_block_versioning(self):
        """Test block version history"""
        block = Block.objects.create(
            page=self.page,
            created_by=self.user,
            **self.block_data
        )
        
        url = reverse('block-versions', kwargs={
            'workspace_slug': self.workspace.slug,
            'page_slug': self.page.slug,
            'block_pk': block.id
        })
        
        # Create versions
        updates = [
            {'content': {'text': 'Version 1'}},
            {'content': {'text': 'Version 2'}}
        ]
        
        for update in updates:
            response = self.client.post(url, update)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Get version history
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)