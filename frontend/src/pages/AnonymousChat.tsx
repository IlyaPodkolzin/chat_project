import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Send as SendIcon, ExitToApp as ExitIcon } from '@mui/icons-material';
import { chatService, interestService } from '../services/api';
import { Message, Chat as ChatType, Interest } from '../types';

const AnonymousChat: React.FC = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [chat, setChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const data = await interestService.getInterests();
      setInterests(data);
    } catch (error) {
      setError('Failed to load interests');
    }
  };

  const handleInterestChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedInterests(value);
  };

  const handleFindChat = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    try {
      const data = await chatService.findAnonymousChat({ interests: selectedInterests });
      setChat(data);
      loadMessages(data.id);
    } catch (error) {
      setError('Failed to find chat');
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const data = await chatService.getChatMessages(chatId);
      setMessages(data);
    } catch (error) {
      setError('Failed to load messages');
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim() || !chat) return;

    try {
      const message = await chatService.sendMessage(chat.id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      setError('Failed to send message');
    }
  };

  const handleLeaveChat = async () => {
    if (!chat) return;

    try {
      await chatService.leaveChat(chat.id);
      setChat(null);
      setMessages([]);
      setSelectedInterests([]);
      navigate('/anonymous-chat');
    } catch (error: any) {
      console.error('Error leaving chat:', error);
      if (error.response?.status === 404) {
        setError('Чат не найден');
      } else if (error.response?.status === 400) {
        setError('Вы не являетесь участником этого чата');
      } else {
        setError('Не удалось покинуть чат');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Anonymous Chat
        </Typography>

        {!chat ? (
          <Paper sx={{ p: 4, mt: 4 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Interests</InputLabel>
              <Select
                multiple
                value={selectedInterests}
                onChange={handleInterestChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Typography key={value} component="span">
                        {value}
                      </Typography>
                    ))}
                  </Box>
                )}
              >
                {interests.map((interest) => (
                  <MenuItem key={interest.id} value={interest.interest}>
                    {interest.interest}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleFindChat}
              sx={{ mt: 2 }}
            >
              Find Chat
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Anonymous Chat
              </Typography>
              <IconButton onClick={handleLeaveChat} color="primary">
                <ExitIcon />
              </IconButton>
            </Box>

            <Paper sx={{ height: '60vh', overflow: 'auto', mb: 2, p: 2 }}>
              <List>
                {messages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>?</Avatar>
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
                            Аноним
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
          </>
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

export default AnonymousChat; 