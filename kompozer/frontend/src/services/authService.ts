import { http } from './httpClient';
import type { AuthResponse, GuestAuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

export const authService = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/login', data);
  },

  register(data: RegisterRequest): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/register', data);
  },

  guest(): Promise<GuestAuthResponse> {
    return http.post<GuestAuthResponse>('/auth/guest');
  },
};
