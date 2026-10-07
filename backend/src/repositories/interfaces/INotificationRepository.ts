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
}