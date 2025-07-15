import { User } from "@shared/schema";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const getAuthUser = (): AuthUser | null => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setAuthUser = (user: AuthUser): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const clearAuthUser = (): void => {
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getAuthUser();
};

export const logout = (): void => {
  clearAuthToken();
  clearAuthUser();
};
