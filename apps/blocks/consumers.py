import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import (
    CollaborationSession,
    CollaborationPresence,
    CollaborationOperation
)

class CollaborationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.page_id = self.scope['url_route']['kwargs']['page_id']
        self.room_group_name = f'collaboration_{self.page_id}'
        self.user = self.scope['user']

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Create or update presence
        await self.update_presence(True)

        await self.accept()

        # Send initial state to the connecting client
        await self.send_initial_state()

    async def disconnect(self, close_code):
        # Update presence status
        await self.update_presence(False)

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'operation':
            await self.handle_operation(data)
        elif message_type == 'cursor_update':
            await self.handle_cursor_update(data)
        elif message_type == 'selection_update':
            await self.handle_selection_update(data)

    @database_sync_to_async
    def update_presence(self, is_active):
        session = CollaborationSession.objects.get(page_id=self.page_id)
        presence, _ = CollaborationPresence.objects.get_or_create(
            session=session,
            user=self.user,
            defaults={'is_active': is_active}
        )
        if presence.is_active != is_active:
            presence.is_active = is_active
            presence.save()

    @database_sync_to_async
    def save_operation(self, data):
        session = CollaborationSession.objects.get(page_id=self.page_id)
        return CollaborationOperation.objects.create(
            session=session,
            user=self.user,
            operation_type=data['operation_type'],
            block_id=data['block_id'],
            data=data['data'],
            version=data['version']
        )

    async def handle_operation(self, data):
        # Save operation to database
        operation = await self.save_operation(data)

        # Broadcast operation to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'collaboration_operation',
                'operation': {
                    'id': str(operation.id),
                    'user_id': str(self.user.id),
                    'operation_type': operation.operation_type,
                    'block_id': str(operation.block_id),
                    'data': operation.data,
                    'version': operation.version,
                    'timestamp': operation.timestamp.isoformat()
                }
            }
        )

    async def handle_cursor_update(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'cursor_position',
                'user_id': str(self.user.id),
                'position': data['position']
            }
        )

    async def handle_selection_update(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'selection_range',
                'user_id': str(self.user.id),
                'range': data['range']
            }
        )

    async def collaboration_operation(self, event):
        await self.send(text_data=json.dumps({
            'type': 'operation',
            'operation': event['operation']
        }))

    async def cursor_position(self, event):
        await self.send(text_data=json.dumps({
            'type': 'cursor_position',
            'user_id': event['user_id'],
            'position': event['position']
        }))

    async def selection_range(self, event):
        await self.send(text_data=json.dumps({
            'type': 'selection_range',
            'user_id': event['user_id'],
            'range': event['range']
        }))

    @database_sync_to_async
    def get_initial_state(self):
        session = CollaborationSession.objects.get(page_id=self.page_id)
        presences = CollaborationPresence.objects.filter(
            session=session,
            is_active=True
        ).select_related('user')
        
        return {
            'active_users': [
                {
                    'id': str(presence.user.id),
                    'name': presence.user.get_full_name(),
                    'avatar': presence.user.avatar.url if presence.user.avatar else None,
                    'cursor_position': presence.cursor_position,
                    'selection_range': presence.selection_range
                }
                for presence in presences
            ]
        }

    async def send_initial_state(self):
        state = await self.get_initial_state()
        await self.send(text_data=json.dumps({
            'type': 'initial_state',
            'state': state
        }))