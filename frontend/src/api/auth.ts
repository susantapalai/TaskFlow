import apiClient from './client';
import type { ApiResponse, User } from '../types';

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/auth/login', payload);
    return data.data;
  },
  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<ApiResponse<User>>('/auth/register', payload);
    return data.data;
  },
};
