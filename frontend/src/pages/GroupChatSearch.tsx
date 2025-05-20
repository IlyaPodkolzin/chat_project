import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { chatService, interestService } from '../services/api';
import { Chat, Interest, GroupChatFilters } from '../types';
import { useAuth } from '../contexts/AuthContext';

const GroupChatSearch: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [filters, setFilters] = useState<GroupChatFilters>({
    name: '',
    min_participants: 0,
    interests: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      loadChats();
      loadInterests();
    }
  }, [user, loading, navigate]);

  const loadChats = async () => {
    try {
      const data = await chatService.getGroupChats(filters);
      setChats(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load chats');
      }
    }
  };

  const loadInterests = async () => {
    try {
      const data = await interestService.getInterests();
      setInterests(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load interests');
      }
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'min_participants' ? parseInt(value) || 0 : value
    }));
  };

  const handleInterestChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setFilters(prev => ({ ...prev, interests: value }));
  };

  const handleSearch = () => {
    loadChats();
  };

  const handleJoinChat = async (chatId: number) => {
    try {
      await chatService.joinChat(chatId);
      loadChats(); // Reload chats to update the list
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to join chat');
      }
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Group Chats
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Chat Name"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Min Participants"
                  name="min_participants"
                  type="number"
                  value={filters.min_participants}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Interests</InputLabel>
                  <Select
                    multiple
                    value={filters.interests}
                    onChange={handleInterestChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
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
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              fullWidth
            >
              Search
            </Button>
          </CardActions>
        </Card>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          {chats.map((chat) => (
            <Grid item xs={12} sm={6} md={4} key={chat.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {chat.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {chat.participants.length} participants
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {chat.interests.map((chatInterest) => (
                      <Chip
                        key={chatInterest.id}
                        label={chatInterest.interest.interest}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    Просмотреть чат
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default GroupChatSearch; 