import type { TicketStatus } from '../../models/Ticket.ts';

export interface NotificationRecord {
  id: string;
  userId: string;
  ticketId: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  ticketId: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<NotificationRecord>;
  findByUser(userId: string): Promise<NotificationRecord[]>;
  countUnreadByUser(userId: string): Promise<number>;
  // Solo marca la notificación si pertenece a ese usuario
  markAsRead(id: string, userId: string): Promise<NotificationRecord | null>;
  markAllAsRead(userId: string): Promise<number>;
  deleteByTicket(ticketId: string): Promise<number>; // al eliminar un ticket
}