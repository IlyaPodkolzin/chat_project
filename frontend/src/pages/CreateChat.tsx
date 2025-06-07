import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { chatService, interestService } from '../services/api';
import { Interest } from '../types/index';
import { useAuth } from '../contexts/AuthContext';

const CreateChat: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    interests: [] as string[],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      loadInterests();
    }
  }, [user, loading, navigate]);

  const loadInterests = async () => {
    try {
      const data = await interestService.getInterests();
      setInterests(data);
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setFormData(prev => ({ ...prev, interests: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a chat name');
      return;
    }

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    try {
      const chat = await chatService.createGroupChat(formData);
      navigate(`/chat/${chat.id}`);
    } catch (error) {
      setError('Failed to create chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Helmet>
        <title>Создание группы | Чат-приложение</title>
      </Helmet>
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Создать новый чат
        </Typography>

        <Paper sx={{ p: 4, mt: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Название чата"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Интересы</InputLabel>
              <Select
                multiple
                value={formData.interests}
                onChange={handleInterestChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
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

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
            >
              Создать чат
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateChat; 