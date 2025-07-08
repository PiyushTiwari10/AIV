import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, Comment, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    return response.data.data!;
  },
};

export const commentsAPI = {
  getComments: async (): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<Comment[]>>('/api/comments');
    return response.data.data!;
  },

  createComment: async (content: string): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>('/api/comments', { content });
    return response.data.data!;
  },

  updateComment: async (id: string, content: string): Promise<Comment> => {
    const response = await api.put<ApiResponse<Comment>>(`/api/comments/${id}`, { content });
    return response.data.data!;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/api/comments/${id}`);
  },
};

export default api; 