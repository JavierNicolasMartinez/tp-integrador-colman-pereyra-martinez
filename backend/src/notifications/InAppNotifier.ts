import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository.ts';
import type { INotifier, Notification } from './INotifier.ts';

// Canal in-app: guarda la notificación en la base como no leída,
// para que el usuario la vea en su bandeja (RF5).
export class InAppNotifier implements INotifier {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async send(notification: Notification): Promise<void> {
    await this.notificationRepository.create({
      userId: notification.userId,
      ticketId: notification.ticketId,
      previousStatus: notification.previousStatus,
      newStatus: notification.newStatus,
      message: notification.message
    });
  }
}