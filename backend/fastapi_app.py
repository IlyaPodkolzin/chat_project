from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from chat.models import Chat, Message, ChatUser, ChatType

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, chat_id: int):
        await websocket.accept()
        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []
        self.active_connections[chat_id].append(websocket)

    def disconnect(self, websocket: WebSocket, chat_id: int):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)
            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast(self, message: str, chat_id: int):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int):
    await manager.connect(websocket, chat_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            chat = Chat.objects.get(id=chat_id)
            user = get_user_model().objects.get(id=message_data['user_id'])
            
            message = Message.objects.create(
                content=message_data['content'],
                sender=user,
                chat=chat
            )
            
            # Format message based on chat type
            if chat.type == ChatType.GROUP:
                formatted_message = f"{user.username}: {message.content}"
            else:  # ANONYMOUS
                formatted_message = f"АНОНИМ: {message.content}"
            
            # Broadcast message to all clients in the chat
            await manager.broadcast(
                json.dumps({
                    'type': 'message',
                    'content': formatted_message,
                    'timestamp': message.created_at.isoformat()
                }),
                chat_id
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, chat_id)
    except Exception as e:
        print(f"Error in websocket: {str(e)}")
        manager.disconnect(websocket, chat_id)

@app.get("/")
async def root():
    return {"message": "FastAPI Chat Server"} 