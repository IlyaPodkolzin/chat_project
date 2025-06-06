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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Send as SendIcon, ExitToApp as ExitIcon } from '@mui/icons-material';
import { chatService, interestService, authService } from '../services/api';
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

  // Данные анонимного пользователя
  const [showAnonymousForm, setShowAnonymousForm] = useState(false);
  const [anonymousData, setAnonymousData] = useState({
    username: '',
    gender: '',
    age: '',
  });

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

  const handleTextChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAnonymousData({
      ...anonymousData,
      [field]: event.target.value,
    });
  };

  const handleSelectChange = (field: string) => (
    event: SelectChangeEvent<string>
  ) => {
    setAnonymousData({
      ...anonymousData,
      [field]: event.target.value,
    });
  };

  const handleFindChat = async () => {
    try {
      // Проверяем, авторизован ли пользователь
      const token = localStorage.getItem('token');
      if (!token) {
        // Если не авторизован, показываем форму регистрации анонимного пользователя
        setShowAnonymousForm(true);
        return;
      }

      await findChat();
    } catch (error) {
      setError('Failed to find chat');
    }
  };

  const findChat = async () => {
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
  };

  const handleAnonymousSubmit = async () => {
    try {
      // Регистрируем анонимного пользователя
      const response = await authService.registerAnonymous({
        username: anonymousData.username,
        gender: anonymousData.gender,
        age: parseInt(anonymousData.age),
      });

      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Закрываем форму и ищем чат
      setShowAnonymousForm(false);
      await findChat();
    } catch (error) {
      setError('Failed to register anonymous user');
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
      const response = await chatService.leaveChat(chat.id);
      
      // Проверяем, был ли удален пользователь
      if (response.data?.user_deleted) {
        // Очищаем локальное хранилище
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Сбрасываем состояние
        setChat(null);
        setMessages([]);
        setSelectedInterests([]);
        // Показываем форму для нового анонимного пользователя
        setShowAnonymousForm(true);
      } else {
        // Обычный выход из чата
        setChat(null);
        setMessages([]);
        setSelectedInterests([]);
        navigate('/anonymous-chat');
      }
    } catch (error: any) {
      console.error('Error leaving chat:', error);
      if (error.response?.status === 401) {
        // Если токен истек или пользователь удален
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setChat(null);
        setMessages([]);
        setSelectedInterests([]);
        setShowAnonymousForm(true);
      } else if (error.response?.status === 404) {
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

        {/* Форма регистрации анонимного пользователя */}
        <Dialog open={showAnonymousForm} onClose={() => setShowAnonymousForm(false)}>
          <DialogTitle>Регистрация анонимного пользователя</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Никнейм"
                value={anonymousData.username}
                onChange={handleTextChange('username')}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Пол</InputLabel>
                <Select
                  value={anonymousData.gender}
                  onChange={handleSelectChange('gender')}
                  label="Пол"
                  required
                >
                  <MenuItem value="male">Мужской</MenuItem>
                  <MenuItem value="female">Женский</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Возраст"
                type="number"
                value={anonymousData.age}
                onChange={handleTextChange('age')}
                margin="normal"
                required
                InputProps={{ inputProps: { min: 18, max: 100 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAnonymousForm(false)}>Отмена</Button>
            <Button onClick={handleAnonymousSubmit} variant="contained" color="primary">
              Продолжить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AnonymousChat; 