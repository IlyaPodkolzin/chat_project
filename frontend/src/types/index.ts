export interface User {
  id: number;
  username: string;
  email: string;
  age: number;
  gender: string;
  interests: Interest[];
  created_at: string;
  updated_at: string;
}

export interface ChatInterest {
  id: number;
  interest: Interest;
  added_at: string;
}

export interface Chat {
  id: number;
  name: string;
  type: ChatType;
  participants: {
    id: number;
    user: User;
    joined_at: string;
  }[];
  interests: ChatInterest[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  chat: Chat;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: number;
  interest: string;
  created_at: string;
  updated_at: string;
}

export enum ChatType {
  GROUP = 'GROUP',
  ANONYMOUS = 'ANONYMOUS',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface AnonymousChatFilters {
  interests: string[];
}

export interface GroupChatFilters {
  name?: string;
  min_participants?: number;
  interests?: string[];
}

export interface CreateGroupChatData {
  name: string;
  interests: string[];
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  age: number;
  gender: string;
  interests: string[];
} 