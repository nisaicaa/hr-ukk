export const API_BASE_URL = 'http://localhost:7000/api';

export const FRONTEND_URLS = {
  AUTH: 'http://localhost:3010',
  ADMIN: 'http://localhost:3011',
  HR: 'http://localhost:3012',
  FINANCE: 'http://localhost:3013',
  EMPLOYEE: 'http://localhost:3014',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  FINANCE: 'FINANCE',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
