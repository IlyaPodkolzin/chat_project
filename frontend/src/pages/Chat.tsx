import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import { Send as SendIcon, ExitToApp as ExitIcon } from '@mui/icons-material';
import { chatService } from '../services/api';
import { Message, Chat as ChatType } from '../types';

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [isParticipant, setIsParticipant] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (id) {
      loadChat();
      loadMessages();
    }
  }, [id]);

  const loadChat = async () => {
    try {
      const data = await chatService.getChat(parseInt(id!));
      console.log('Chat data:', data);
      setChat(data);
      // Проверяем, является ли текущий пользователь участником чата
      const userStr = localStorage.getItem('user');
      console.log('User string from localStorage:', userStr);
      const currentUser = userStr ? JSON.parse(userStr) : null;
      console.log('Current user from localStorage:', currentUser);
      
      if (!currentUser) {
        console.error('No user data in localStorage');
        navigate('/login');
        return;
      }

      console.log('Participants array:', data.participants);
      console.log('Participant IDs:', data.participants.map(p => p.user.id));
      console.log('Current user ID:', currentUser.id);
      const isUserParticipant = data.participants.some(p => {
        console.log('Comparing:', p.user.id, currentUser.id, p.user.id === currentUser.id);
        return p.user.id === currentUser.id;
      });
      console.log('Is user participant:', isUserParticipant);
      setIsParticipant(isUserParticipant);
    } catch (error: any) {
      console.error('Error loading chat:', error);
      if (error.response?.status === 404) {
        setError('Чат не найден');
        navigate('/group-chats');
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Не удалось загрузить чат');
        navigate('/group-chats');
      }
    }
  };

  const loadMessages = async () => {
    try {
      const data = await chatService.getChatMessages(parseInt(id!));
      setMessages(data);
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !isParticipant) return;

    try {
      const message = await chatService.sendMessage(parseInt(id!), newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const handleJoinChat = async () => {
    try {
      const updatedChat = await chatService.joinChat(parseInt(id!));
      console.log('Updated chat after join:', updatedChat);
      setChat(updatedChat);
      
      // Проверяем, является ли текущий пользователь участником чата
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      if (!currentUser) {
        console.error('No user data in localStorage');
        navigate('/login');
        return;
      }

      const isUserParticipant = updatedChat.participants.some(p => p.user.id === currentUser.id);
      console.log('Is user participant after join:', isUserParticipant);
      setIsParticipant(isUserParticipant);
      // Перезагружаем сообщения после присоединения
      loadMessages();
    } catch (error: any) {
      console.error('Error joining chat:', error);
      if (error.response?.status === 400) {
        if (error.response.data.error === 'Already joined this chat') {
          setError('Вы уже присоединились к этому чату');
          setIsParticipant(true);
          loadChat();
        } else {
          setError(error.response.data.error || 'Не удалось присоединиться к чату');
        }
      } else if (error.response?.status === 404) {
        setError('Чат не найден');
        navigate('/group-chats');
      } else {
        setError('Произошла ошибка при присоединении к чату');
      }
    }
  };

  const handleLeaveChat = async () => {
    try {
      const response = await chatService.leaveChat(parseInt(id!));
      
      // Проверяем, был ли удален пользователь
      if (response.data?.user_deleted) {
        // Очищаем локальное хранилище
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Перенаправляем на страницу анонимного чата
        navigate('/anonymous-chat');
      } else {
        // Обычный выход из чата
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Error leaving chat:', error);
      if (error.response?.status === 401) {
        // Если токен истек или пользователь удален
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/anonymous-chat');
      } else {
        setError('Failed to leave chat');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!chat) {
    return (
      <Container>
        <Helmet>
          <title>Загрузка... | Чат-приложение</title>
        </Helmet>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>{chat.name} | Чат-приложение</title>
      </Helmet>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {chat.name}
          </Typography>
          {isParticipant && (
            <IconButton onClick={handleLeaveChat} color="primary">
              <ExitIcon />
            </IconButton>
          )}
        </Box>

        <Paper sx={{ height: '60vh', overflow: 'auto', mb: 2, p: 2 }}>
          <List>
            {chat.type === 'ANONYMOUS' ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      align="center"
                      color={chat.participants.length === 1 ? 'warning.main' : 'success.main'}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {chat.participants.length === 1 ? 'Ищем анонимного собеседника...' : 'Собеседник найден!'}
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      align="center"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Здесь начинается новый чат
                    </Typography>
                  }
                />
              </ListItem>
            )}
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{message.sender.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        component="span"
                        sx={{
                          color: message.sender.id === currentUser.id ? 'success.main' : 'info.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {chat.type === 'GROUP' ? message.sender.username : 'Аноним'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(message.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        {!isParticipant ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleJoinChat}
            >
              Присоединиться к чату
            </Button>
          </Box>
        ) : (
          <Paper component="form" onSubmit={handleSendMessage} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                variant="outlined"
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </Box>
          </Paper>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Chat; 