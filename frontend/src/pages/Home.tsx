import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Chat App
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Group Chats
                </Typography>
                <Typography color="text.secondary">
                  Join existing group chats or create your own based on interests
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate('/group-chats')}
                >
                  Browse Chats
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate('/create-chat')}
                >
                  Create Chat
                </Button>
              </CardActions>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Anonymous Chat
                </Typography>
                <Typography color="text.secondary">
                  Chat anonymously with others who share your interests
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate('/anonymous-chat')}
                >
                  Start Chatting
                </Button>
              </CardActions>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile
                </Typography>
                <Typography color="text.secondary">
                  View and manage your profile, interests, and chat history
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ChatIcon />}
          onClick={() => navigate('/login')}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
};

export default Home; 