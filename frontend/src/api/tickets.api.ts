import type { Ticket, TicketInput, TicketStatus } from '../types/index.ts';
import { apiFetch } from './client.ts';

export function listTickets(): Promise<Ticket[]> {
  return apiFetch<Ticket[]>('/tickets');
}

export function getTicket(id: string): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`);
}

export function createTicket(data: TicketInput): Promise<Ticket> {
  return apiFetch<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTicket(id: string, data: TicketInput): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function changeTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  return apiFetch<Ticket>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteTicket(id: string): Promise<void> {
  return apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' });
}
