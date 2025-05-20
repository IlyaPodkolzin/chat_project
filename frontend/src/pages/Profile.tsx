import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Divider,
} from '@mui/material';
import { chatService, authService } from '../services/api';
import { Chat, ChatType, User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: '',
  });

  useEffect(() => {
    loadUserData();
    loadUserChats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setFormData({
        username: userData.username,
        age: userData.age?.toString() || '',
        gender: userData.gender || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/login');
    }
  };

  const loadUserChats = async () => {
    try {
      const data = await chatService.getUserChats();
      setChats(data);
    } catch (error) {
      console.error('Error loading user chats:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement update user API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(prev => prev ? {
        ...prev,
        username: formData.username,
        age: parseInt(formData.age),
        gender: formData.gender,
      } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Профиль
        </Typography>

        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Typography variant="h6" gutterBottom>
                Личные данные
              </Typography>
              {isEditing ? (
                <>
                  <TextField
                    fullWidth
                    label="Имя пользователя"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Возраст"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Пол"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                    >
                      Отменить
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" gutterBottom>
                    Имя пользователя: {user.username}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Возраст: {user.age}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Пол: {user.gender}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Email: {user.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(true)}
                    sx={{ mt: 2 }}
                  >
                    Редактировать профиль
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Мои чаты
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {chats.map((chat) => (
            <Box key={chat.id} sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {chat.type === ChatType.GROUP ? chat.name : 'Anonymous Chat'}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Тип: {chat.type}
                  </Typography>
                  <Typography color="text.secondary">
                    Участники: {chat.participants.length}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    Открыть чат
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Profile; 