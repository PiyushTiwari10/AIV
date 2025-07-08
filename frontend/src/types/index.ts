export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WebSocketMessage {
  type: 'comment' | 'typing' | 'user_join' | 'user_leave';
  data: any;
  userId?: string;
  username?: string;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ActiveUser {
  id: string;
  username: string;
} 