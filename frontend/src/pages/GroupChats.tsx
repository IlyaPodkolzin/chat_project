import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { chatService, interestService } from '../services/api';
import { Chat, Interest } from '../types';

const GroupChats: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    min_participants: '',
    interests: [] as string[],
  });

  useEffect(() => {
    loadChats();
    loadInterests();
  }, []);

  const loadChats = async () => {
    try {
      const data = await chatService.getGroupChats({
        ...filters,
        min_participants: filters.min_participants ? Number(filters.min_participants) : undefined
      });
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadInterests = async () => {
    try {
      const data = await interestService.getInterests();
      setInterests(data);
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Group Chats
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Search by name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Minimum participants"
              name="min_participants"
              type="number"
              value={filters.min_participants}
              onChange={handleFilterChange}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel>Interests</InputLabel>
              <Select
                multiple
                value={filters.interests}
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
          </Box>
          <Box sx={{ flex: '1 1 100%', display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/create-chat')}
            >
              Create New Chat
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {chats.map((chat) => (
            <Box key={chat.id} sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {chat.name}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Participants: {chat.participants.length}
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
                    onClick={() => handleJoinChat(chat.id)}
                  >
                    Join Chat
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

export default GroupChats; 