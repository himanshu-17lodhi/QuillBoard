from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.exceptions import ObjectDoesNotExist
from .models import CollaborationSession, Presence
import json

class CollaborationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.page_id = self.scope['url_route']['kwargs']['page_id']
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return

        try:
            self.session = await self.get_or_create_session()
            await self.channel_layer.group_add(
                f"page_{self.page_id}",
                self.channel_name
            )
            await self.accept()
            await self.send_initial_state()
        except ObjectDoesNotExist:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'page_id'):
            await self.channel_layer.group_discard(
                f"page_{self.page_id}",
                self.channel_name
            )
            await self.update_presence(False)

    async def receive_json(self, content):
        message_type = content.get('type')
        
        handlers = {
            'presence': self.handle_presence,
            'block_update': self.handle_block_update,
            'cursor_position': self.handle_cursor_position,
            'selection': self.handle_selection,
            'heartbeat': self.handle_heartbeat
        }
        
        handler = handlers.get(message_type)
        if handler:
            await handler(content.get('data', {}))

    async def handle_presence(self, data):
        await self.update_presence(True)
        await self.broadcast_presence()

    async def handle_block_update(self, data):
        block_id = data.get('blockId')
        content = data.get('content')
        
        if block_id and content:
            await self.save_block_update(block_id, content)
            await self.channel_layer.group_send(
                f"page_{self.page_id}",
                {
                    'type': 'block_update',
                    'user_id': self.user.id,
                    'block_id': block_id,
                    'content': content
                }
            )

    async def handle_cursor_position(self, data):
        await self.channel_layer.group_send(
            f"page_{self.page_id}",
            {
                'type': 'cursor_position',
                'user_id': self.user.id,
                'position': data.get('position')
            }
        )

    async def handle_selection(self, data):
        await self.channel_layer.group_send(
            f"page_{self.page_id}",
            {
                'type': 'selection',
                'user_id': self.user.id,
                'selection': data.get('selection')
            }
        )

    async def handle_heartbeat(self, data):
        await self.update_presence(True)

    async def block_update(self, event):
        if event['user_id'] != self.user.id:
            await self.send_json({
                'type': 'block_update',
                'data': {
                    'blockId': event['block_id'],
                    'content': event['content'],
                    'userId': event['user_id']
                }
            })

    async def cursor_position(self, event):
        if event['user_id'] != self.user.id:
            await self.send_json({
                'type': 'cursor_position',
                'data': {
                    'userId': event['user_id'],
                    'position': event['position']
                }
            })

    async def selection(self, event):
        if event['user_id'] != self.user.id:
            await self.send_json({
                'type': 'selection',
                'data': {
                    'userId': event['user_id'],
                    'selection': event['selection']
                }
            })

    @database_sync_to_async
    def get_or_create_session(self):
        session, _ = CollaborationSession.objects.get_or_create(
            page_id=self.page_id
        )
        return session

    @database_sync_to_async
    def update_presence(self, is_active):
        Presence.objects.update_or_create(
            session=self.session,
            user=self.user,
            defaults={'is_active': is_active}
        )

    @database_sync_to_async
    def save_block_update(self, block_id, content):
        from apps.blocks.models import Block
        block = Block.objects.get(id=block_id)
        block.content = content
        block.save(update_fields=['content'])
        block.create_version(self.user)

    @database_sync_to_async
    def get_active_users(self):
        return list(Presence.objects.filter(
            session=self.session,
            is_active=True
        ).select_related('user').values(
            'user_id',
            'user__email',
            'user__first_name',
            'user__last_name'
        ))

    async def broadcast_presence(self):
        active_users = await self.get_active_users()
        await self.channel_layer.group_send(
            f"page_{self.page_id}",
            {
                'type': 'presence_update',
                'users': active_users
            }
        )

    async def presence_update(self, event):
        await self.send_json({
            'type': 'presence_update',
            'data': event['users']
        })

    async def send_initial_state(self):
        active_users = await self.get_active_users()
        await self.send_json({
            'type': 'initial_state',
            'data': {
                'users': active_users
            }
        })