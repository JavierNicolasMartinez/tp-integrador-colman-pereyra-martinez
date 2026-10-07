import Notification, { type INotification } from '../models/Notification.ts';
import type {
  CreateNotificationData,
  INotificationRepository,
  NotificationRecord
} from './interfaces/INotificationRepository.ts';

// Convierte el documento de Mongoose en datos planos para los services
function toNotificationRecord(doc: INotification): NotificationRecord {
  return {
    id: String(doc._id),
    userId: String(doc.user),
    ticketId: String(doc.ticket),
    previousStatus: doc.previousStatus,
    newStatus: doc.newStatus,
    message: doc.message,
    isRead: doc.isRead,
    createdAt: doc.createdAt
  };
}

export class NotificationRepository implements INotificationRepository {
  async create(data: CreateNotificationData): Promise<NotificationRecord> {
    const doc = await Notification.create({
      user: data.userId,
      ticket: data.ticketId,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      message: data.message
    });
    return toNotificationRecord(doc);
  }
}