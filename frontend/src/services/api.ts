import axios from 'axios';
import {
  User,
  Chat,
  Message,
  Interest,
  AnonymousChatFilters,
  GroupChatFilters,
  CreateGroupChatData,
  LoginData,
  RegisterData,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data: LoginData): Promise<{ token: string; user: User }> => {
    const response = await api.post('/api/token/', data);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    const userResponse = await api.get('/api/users/me/');
    return { token: access, user: userResponse.data };
  },

  register: async (data: RegisterData): Promise<{ token: string; user: User }> => {
    const response = await api.post('/api/users/register/', data);
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    const userResponse = await api.get('/api/users/me/');
    return { token: access, user: userResponse.data };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/users/me/');
    return response.data;
  },

  refreshToken: async (): Promise<string> => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) throw new Error('No refresh token');
    
    const response = await api.post('/api/token/refresh/', { refresh });
    const { access } = response.data;
    localStorage.setItem('token', access);
    return access;
  },
};

export const chatService = {
  getGroupChats: async (filters?: GroupChatFilters): Promise<Chat[]> => {
    const response = await api.get('/api/chats/group_chats/', { params: filters });
    return response.data;
  },

  getUserChats: async (): Promise<Chat[]> => {
    const response = await api.get('/api/chats/');
    return response.data;
  },

  findAnonymousChat: async (filters: AnonymousChatFilters): Promise<Chat> => {
    const response = await api.post('/api/chats/find_anonymous_chat/', filters);
    return response.data;
  },

  joinChat: async (chatId: number): Promise<Chat> => {
    const response = await api.post(`/api/chats/${chatId}/join_chat/`);
    return response.data;
  },

  leaveChat: async (chatId: number): Promise<void> => {
    await api.post(`/api/chats/${chatId}/leave_chat/`);
  },

  getChat: async (chatId: number): Promise<Chat> => {
    const response = await api.get(`/api/chats/${chatId}/`);
    return response.data;
  },

  createGroupChat: async (data: CreateGroupChatData): Promise<Chat> => {
    const response = await api.post('/api/chats/', {
      name: data.name,
      interest_names: data.interests
    });
    return response.data;
  },

  getChatMessages: async (chatId: number): Promise<Message[]> => {
    const response = await api.get(`/api/messages/`, { params: { chat: chatId } });
    return response.data;
  },

  sendMessage: async (chatId: number, content: string): Promise<Message> => {
    const response = await api.post('/api/messages/', { chat: chatId, content });
    return response.data;
  },
};

export const interestService = {
  getInterests: async (): Promise<Interest[]> => {
    const response = await api.get('/api/interests/');
    return response.data;
  },
}; 