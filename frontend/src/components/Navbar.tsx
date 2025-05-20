import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/profile')}
                sx={{
                  backgroundColor: isActive('/profile') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Профиль
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/group-chats')}
                sx={{
                  backgroundColor: isActive('/group-chats') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Групповые чаты
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/anonymous-chat')}
                sx={{
                  backgroundColor: isActive('/anonymous-chat') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Анонимный чат
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              Главная
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: isActive('/login') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: isActive('/register') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                }}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 