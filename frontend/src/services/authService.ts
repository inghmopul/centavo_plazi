import { apiClient } from './apiClient';
import type { LoginCredentials, AuthResponse, User } from '../types/auth';

const TOKEN_KEY = 'centavo_token';
const USER_KEY = 'centavo_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Intento contra el servicio auth-service
      const response = await apiClient.post<AuthResponse | { data: AuthResponse }>('/auth/login', credentials);
      const authData: AuthResponse = 'data' in response ? response.data : response;
      localStorage.setItem(TOKEN_KEY, authData.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
      return authData;
    } catch {
      // Modo demostración/desarrollo cuando el microservicio de auth aún no está activo
      if (!credentials.email || !credentials.password) {
        throw new Error('Por favor ingresa un correo y contraseña válidos.');
      }

      const mockUser: User = {
        id: 'usr_demo123',
        email: credentials.email,
        name: credentials.email.split('@')[0].replace('.', ' '),
        createdAt: new Date().toISOString(),
      };

      const mockResponse: AuthResponse = {
        user: mockUser,
        token: 'mock_jwt_token_centavo_dev',
      };

      localStorage.setItem(TOKEN_KEY, mockResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Silencioso en caso de estar offline
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};
