import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { chatService } from '../services/api';
import { Chat, Message, ChatType } from '../types/index';

const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadChat();
      connectWebSocket();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [chatId]);

  const loadChat = async () => {
    try {
      const data = await chatService.getChat(parseInt(chatId!));
      setChat(data);
      const messages = await chatService.getChatMessages(parseInt(chatId!));
      setMessages(messages);
    } catch (error) {
      console.error('Error loading chat:', error);
      navigate('/');
    }
  };

  const connectWebSocket = () => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}`);
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, {
          id: Date.now(),
          content: data.content,
          created_at: data.timestamp,
          updated_at: data.timestamp,
          sender: { id: 0, username: 'Anonymous' } as any,
          chat: chat as any
        }]);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWs(websocket);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !ws) return;

    try {
      await chatService.sendMessage(parseInt(chatId!), message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLeaveChat = async () => {
    try {
      await chatService.leaveChat(parseInt(chatId!));
      navigate('/');
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const formatMessage = (message: Message) => {
    if (chat?.type === ChatType.GROUP) {
      return `${message.sender.username}: ${message.content}`;
    } else {
      const isCurrentUser = message.sender.id === 1; // Replace with actual current user ID
      return `АНОНИМ${isCurrentUser ? ' (Вы)' : ''}: ${message.content}`;
    }
  };

  if (!chat) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            {chat.type === ChatType.GROUP ? chat.name : 'Anonymous Chat'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={handleLeaveChat}
          >
            Leave Chat
          </Button>
        </Box>

        <Paper
          sx={{
            height: '60vh',
            overflow: 'auto',
            mb: 2,
            p: 2,
            backgroundColor: '#f5f5f5',
          }}
        >
          <List>
            {messages.map((msg) => (
              <React.Fragment key={msg.id}>
                <ListItem>
                  <ListItemText
                    primary={formatMessage(msg)}
                    secondary={new Date(msg.created_at).toLocaleTimeString()}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: chat.type === ChatType.ANONYMOUS && msg.sender.id === 1 ? 'green' : 'inherit',
                      },
                    }}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatRoom; 