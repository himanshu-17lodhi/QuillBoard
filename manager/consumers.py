import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Document
from .tasks import autosave_document

class DocumentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.room_group_name = f'document_{self.document_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('content')
        
        if content:
            await database_sync_to_async(autosave_document.delay)(self.document_id, content, self.scope['user'].id)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'document_update',
                    'content': content,
                    'user': self.scope['user'].username
                }
            )

    async def document_update(self, event):
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'user': event['user']
        }))