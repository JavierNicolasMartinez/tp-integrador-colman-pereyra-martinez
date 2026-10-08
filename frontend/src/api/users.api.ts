import type { RoleName, UserSummary } from '../types/index.ts';
import { apiFetch } from './client.ts';

export function listUsers(): Promise<UserSummary[]> {
  return apiFetch<UserSummary[]>('/users');
}

export function assignRole(userId: string, role: RoleName): Promise<UserSummary> {
  return apiFetch<UserSummary>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}
