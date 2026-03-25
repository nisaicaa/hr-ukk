import type { UserRole } from '../constant';
import { FRONTEND_URLS } from '../constant';

export interface User {
  id_user: number;
  username: string;
  email: string;
  role: UserRole;
}

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = FRONTEND_URLS.AUTH;
};

export const checkRole = (requiredRole: UserRole): boolean => {
  const user = getUser();
  return user?.role === requiredRole;
};

export const redirectToLogin = (): void => {
  window.location.href = FRONTEND_URLS.AUTH;
};

export const bootstrapAuthFromQuery = (): void => {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }
  } catch {
    // ignore
  }
};
