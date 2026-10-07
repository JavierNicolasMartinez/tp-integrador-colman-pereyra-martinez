import { HttpError } from '../errors/HttpError.ts';
import type { TicketStatus } from '../models/Ticket.ts';
import type { ISubject } from '../observer/ISubject.ts';
import type { TicketStatusChangedEvent } from '../observer/TicketStatusChangedEvent.ts';
import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository.ts';
import type { ISubscriptionRepository } from '../repositories/interfaces/ISubscriptionRepository.ts';
import type {
  CreateTicketData,
  ITicketRepository,
  TicketRecord,
  UpdateTicketData
} from '../repositories/interfaces/ITicketRepository.ts';

export class TicketService {
  // Depende de interfaces (inversión de dependencias). El Subject llega por constructor.
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly eventPublisher: ISubject<TicketStatusChangedEvent>
  ) {}

  list(): Promise<TicketRecord[]> {
    return this.ticketRepository.findAll();
  }

  async getById(id: string): Promise<TicketRecord> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) {
      throw new HttpError(404, 'Ticket no encontrado');
    }
    return ticket;
  }

  create(data: CreateTicketData): Promise<TicketRecord> {
    return this.ticketRepository.create(data);
  }

  async update(id: string, data: UpdateTicketData): Promise<TicketRecord> {
    const ticket = await this.ticketRepository.update(id, data);
    if (!ticket) {
      throw new HttpError(404, 'Ticket no encontrado');
    }
    return ticket;
  }

  async changeStatus(id: string, newStatus: TicketStatus): Promise<TicketRecord> {
    const current = await this.getById(id);

    if (current.status === newStatus) {
      throw new HttpError(400, `El ticket ya está en estado ${newStatus}`);
    }

    const updated = await this.ticketRepository.updateStatus(id, newStatus);
    if (!updated) {
      throw new HttpError(404, 'Ticket no encontrado');
    }

    // Observer: se avisa al Subject y él notifica a todos los observers registrados
    await this.eventPublisher.notify({
      ticketId: updated.id,
      ticketTitle: updated.title,
      previousStatus: current.status,
      newStatus: updated.status
    });

    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.ticketRepository.delete(id);
    if (!deleted) {
      throw new HttpError(404, 'Ticket no encontrado');
    }

    // Se borran las suscripciones y notificaciones que apuntaban al ticket eliminado
    await Promise.all([
      this.subscriptionRepository.deleteByTicket(id),
      this.notificationRepository.deleteByTicket(id)
    ]);
  }
}
