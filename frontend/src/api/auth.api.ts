import type { AuthResponse, AuthUser } from '../types/index.ts';
import { apiFetch } from './client.ts';

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Usuario logueado con sus permisos (para recuperar la sesión al recargar)
export function me(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}
