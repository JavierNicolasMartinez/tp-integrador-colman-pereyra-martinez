import type { Subscription } from '../types/index.ts';
import { apiFetch } from './client.ts';

export async function isSubscribed(ticketId: string): Promise<boolean> {
  const { subscribed } = await apiFetch<{ subscribed: boolean }>(`/subscriptions/${ticketId}`);
  return subscribed;
}

export function subscribe(ticketId: string): Promise<Subscription> {
  return apiFetch<Subscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ ticketId }),
  });
}

export function unsubscribe(ticketId: string): Promise<void> {
  return apiFetch<void>(`/subscriptions/${ticketId}`, { method: 'DELETE' });
}
