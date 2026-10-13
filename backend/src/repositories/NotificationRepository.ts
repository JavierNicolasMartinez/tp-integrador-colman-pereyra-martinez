import { isValidObjectId } from 'mongoose';
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

  async findByUser(userId: string): Promise<NotificationRecord[]> {
    const docs = await Notification.find({ user: userId }).sort({ createdAt: -1 }); // las más nuevas primero
    return docs.map(toNotificationRecord);
  }

  async countUnreadByUser(userId: string): Promise<number> {
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    if (!isValidObjectId(id)) return null;

    // Se filtra también por usuario: nadie puede marcar notificaciones ajenas
    const doc = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { returnDocument: 'after' }
    );
    return doc ? toNotificationRecord(doc) : null;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    return result.modifiedCount;
  }

  async deleteByTicket(ticketId: string): Promise<number> {
    if (!isValidObjectId(ticketId)) return 0;

    const result = await Notification.deleteMany({ ticket: ticketId });
    return result.deletedCount;
  }
}