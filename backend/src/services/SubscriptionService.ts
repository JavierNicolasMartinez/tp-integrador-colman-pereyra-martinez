import { HttpError } from '../errors/HttpError.ts';
import type {
  ISubscriptionRepository,
  SubscriptionRecord
} from '../repositories/interfaces/ISubscriptionRepository.ts';
import type { ITicketRepository } from '../repositories/interfaces/ITicketRepository.ts';

// RF4: un usuario se suscribe y desuscribe de un ticket.
// Las suscripciones son datos persistidos; el NotificationService las consulta
// para saber a quién avisar cuando el ticket cambia de estado.
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly ticketRepository: ITicketRepository
  ) {}

  async subscribe(userId: string, ticketId: string): Promise<SubscriptionRecord> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new HttpError(404, 'Ticket no encontrado');
    }

    if (await this.subscriptionRepository.exists(userId, ticketId)) {
      throw new HttpError(409, 'Ya estás suscripto a este ticket');
    }

    return this.subscriptionRepository.create(userId, ticketId);
  }

  async unsubscribe(userId: string, ticketId: string): Promise<void> {
    const deleted = await this.subscriptionRepository.delete(userId, ticketId);
    if (!deleted) {
      throw new HttpError(404, 'No estás suscripto a este ticket');
    }
  }

  // Para el botón suscribirse / desuscribirse del detalle del ticket
  isSubscribed(userId: string, ticketId: string): Promise<boolean> {
    return this.subscriptionRepository.exists(userId, ticketId);
  }

  listForUser(userId: string): Promise<SubscriptionRecord[]> {
    return this.subscriptionRepository.findByUser(userId);
  }
}
