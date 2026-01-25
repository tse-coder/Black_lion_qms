import axios from 'axios';
import type { LoginCredentials, AuthResponse, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE_URL}/auth/logout`);
  },

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  },

  storeToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  },

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
