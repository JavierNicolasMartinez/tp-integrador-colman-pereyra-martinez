import type { IObserver } from './IObserver.ts';
import type { ISubject } from './ISubject.ts';
import type { TicketStatusChangedEvent } from './TicketStatusChangedEvent.ts';

// Subject del patrón Observer, implementado a mano (sin EventEmitter de Node).
// TicketService lo recibe por constructor y lo invoca cuando cambia un estado;
// los observers (NotificationService) se registran desde main.ts.
export class EventPublisher implements ISubject<TicketStatusChangedEvent> {
  private readonly observers: IObserver<TicketStatusChangedEvent>[] = [];

  attach(observer: IObserver<TicketStatusChangedEvent>): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: IObserver<TicketStatusChangedEvent>): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  async notify(event: TicketStatusChangedEvent): Promise<void> {
    // Se avisa a todos los observers. Si uno falla, los demás igual reciben el evento
    // y el cambio de estado (que ya se guardó) no se revierte.
    const results = await Promise.allSettled(
      this.observers.map((observer) => observer.update(event))
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[EventPublisher] Un observer falló al procesar el evento:', result.reason);
      }
    }
  }
}
