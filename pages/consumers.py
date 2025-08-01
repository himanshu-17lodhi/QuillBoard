import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class PageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.page_id = self.scope['url_route']['kwargs']['page_id']
        self.room_group_name = f'page_{self.page_id}'
        
        # Check if user has permission to access this page
        if self.scope["user"] == AnonymousUser():
            await self.close()
            return
            
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'block_update':
            await self.handle_block_update(text_data_json)
        elif message_type == 'cursor_position':
            await self.handle_cursor_position(text_data_json)
        elif message_type == 'page_update':
            await self.handle_page_update(text_data_json)

    async def handle_block_update(self, data):
        # Save block update to database
        await self.save_block_update(data)
        
        # Send update to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'block_update',
                'block_id': data['block_id'],
                'content': data['content'],
                'user': self.scope["user"].username,
                'timestamp': data.get('timestamp')
            }
        )

    async def handle_cursor_position(self, data):
        # Send cursor position to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_position',
                'block_id': data['block_id'],
                'position': data['position'],
                'user': self.scope["user"].username,
                'user_id': self.scope["user"].id
            }
        )

    async def handle_page_update(self, data):
        # Save page update to database
        await self.save_page_update(data)
        
        # Send update to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'page_update',
                'field': data['field'],
                'value': data['value'],
                'user': self.scope["user"].username,
                'timestamp': data.get('timestamp')
            }
        )

    # Send methods
    async def block_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'block_update',
            'block_id': event['block_id'],
            'content': event['content'],
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    async def cursor_position(self, event):
        # Don't send cursor position back to the sender
        if event['user'] != self.scope["user"].username:
            await self.send(text_data=json.dumps({
                'type': 'cursor_position',
                'block_id': event['block_id'],
                'position': event['position'],
                'user': event['user'],
                'user_id': event['user_id']
            }))

    async def page_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'page_update',
            'field': event['field'],
            'value': event['value'],
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def save_block_update(self, data):
        from .models import Block
        try:
            block = Block.objects.get(id=data['block_id'])
            block.content = data['content']
            block.save()
        except Block.DoesNotExist:
            pass

    @database_sync_to_async
    def save_page_update(self, data):
        from .models import Page
        try:
            page = Page.objects.get(id=self.page_id)
            setattr(page, data['field'], data['value'])
            page.save()
        except Page.DoesNotExist:
            pass


class WorkspaceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.workspace_slug = self.scope['url_route']['kwargs']['workspace_slug']
        self.room_group_name = f'workspace_{self.workspace_slug}'
        
        # Check if user has permission to access this workspace
        if self.scope["user"] == AnonymousUser():
            await self.close()
            return
            
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        
        if message_type == 'workspace_update':
            await self.handle_workspace_update(text_data_json)

    async def handle_workspace_update(self, data):
        # Send update to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'workspace_update',
                'action': data['action'],
                'data': data['data'],
                'user': self.scope["user"].username
            }
        )

    async def workspace_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'workspace_update',
            'action': event['action'],
            'data': event['data'],
            'user': event['user']
        }))