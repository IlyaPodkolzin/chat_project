import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { theme } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GroupChatSearch from './pages/GroupChatSearch';
import Chat from './pages/Chat';
import AnonymousChat from './pages/AnonymousChat';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/anonymous-chat" element={<AnonymousChat />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoutes />
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

const ProtectedRoutes: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/anonymous-chat" replace />;
  }

  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/group-chats" element={<GroupChatSearch />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
};

export default App; 