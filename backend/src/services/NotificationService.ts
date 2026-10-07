import { HttpError } from '../errors/HttpError.ts';
import type { INotifier, Notification } from '../notifications/INotifier.ts';
import type { NotifierChannel, NotifierFactory } from '../notifications/NotifierFactory.ts';
import type { IObserver } from '../observer/IObserver.ts';
import type { TicketStatusChangedEvent } from '../observer/TicketStatusChangedEvent.ts';
import type {
  INotificationRepository,
  NotificationRecord
} from '../repositories/interfaces/INotificationRepository.ts';
import type { ISubscriptionRepository } from '../repositories/interfaces/ISubscriptionRepository.ts';

// Observer: se registra en el EventPublisher desde main.ts y reacciona a cada
// cambio de estado avisándole a los suscriptores del ticket por todos los canales.
export class NotificationService implements IObserver<TicketStatusChangedEvent> {
  private readonly notifiers: INotifier[];

  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly notificationRepository: INotificationRepository,
    notifierFactory: NotifierFactory,
    channels: NotifierChannel[] = ['inapp', 'console']
  ) {
    // Los canales los crea la Factory: este service nunca hace `new` de un canal
    // ni llama a console.log, solo conoce INotifier.
    this.notifiers = channels.map((channel) => notifierFactory.create(channel));
  }

  async update(event: TicketStatusChangedEvent): Promise<void> {
    // Las suscripciones son datos: indican qué usuarios siguen este ticket
    const subscribers = await this.subscriptionRepository.findSubscribersByTicket(event.ticketId);

    const deliveries = subscribers.flatMap((subscriber) => {
      const notification: Notification = {
        userId: subscriber.userId,
        userEmail: subscriber.email,
        ticketId: event.ticketId,
        ticketTitle: event.ticketTitle,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        message: `El ticket "${event.ticketTitle}" pasó de ${event.previousStatus} a ${event.newStatus}`
      };
      return this.notifiers.map((notifier) => notifier.send(notification));
    });

    await Promise.all(deliveries);
  }

  // --- Bandeja de notificaciones (RF5) ---

  listForUser(userId: string): Promise<NotificationRecord[]> {
    return this.notificationRepository.findByUser(userId);
  }

  countUnread(userId: string): Promise<number> {
    return this.notificationRepository.countUnreadByUser(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationRecord> {
    const notification = await this.notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new HttpError(404, 'Notificación no encontrada');
    }
    return notification;
  }

  markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId);
  }
}
