import api from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export const register = async (
  email: string,
  password: string,
  name: string,
  school?: string
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
    email,
    password,
    name,
    school,
  });
  return response.data.data!;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
    email,
    password,
  });
  return response.data.data!;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/users/me');
  return response.data.data!;
};

export const updateMe = async (data: {
  name?: string;
  school?: string;
}): Promise<User> => {
  const response = await api.patch<ApiResponse<User>>('/users/me', data);
  return response.data.data!;
};
