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
  Grid,
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

  // Фильтры
  const [gender, setGender] = useState<string>('');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');

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

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGender(event.target.value);
  };

  const handleFindChat = async () => {
    try {
      const filters: any = {};

      if (selectedInterests.length > 0) {
        filters.interests = selectedInterests;
      }

      if (gender) {
        filters.gender = gender;
      }

      if (minAge) {
        filters.min_age = parseInt(minAge);
      }

      if (maxAge) {
        filters.max_age = parseInt(maxAge);
      }

      const data = await chatService.findAnonymousChat(filters);
      navigate(`/chat/${data.id}`);
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
          Анонимный чат
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Фильтры анонимных чатов
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Интересы</InputLabel>
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Пол собеседника</InputLabel>
                <Select
                  value={gender}
                  onChange={handleGenderChange}
                  label="Пол собеседника"
                >
                  <MenuItem value="">Любой</MenuItem>
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Минимальный возраст"
                type="number"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                InputProps={{ inputProps: { min: 18, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Максимальный возраст"
                type="number"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                InputProps={{ inputProps: { min: 18, max: 100 } }}
              />
            </Grid>
          </Grid>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleFindChat}
            sx={{ mt: 2 }}
          >
            Найти чат
          </Button>
        </Paper>

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