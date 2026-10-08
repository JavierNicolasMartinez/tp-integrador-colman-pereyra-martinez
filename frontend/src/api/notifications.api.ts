import type { AppNotification } from '../types/index.ts';
import { apiFetch } from './client.ts';

export function listNotifications(): Promise<AppNotification[]> {
  return apiFetch<AppNotification[]>('/notifications');
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await apiFetch<{ count: number }>('/notifications/unread-count');
  return count;
}

export function markAsRead(id: string): Promise<AppNotification> {
  return apiFetch<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllAsRead(): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>('/notifications/read-all', { method: 'PATCH' });
}
