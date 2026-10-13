import type { TicketStatus } from '../models/Ticket.ts';

// Datos de una notificación que viajan por los canales.
// Es un objeto plano: los canales no dependen de Mongoose.
export interface Notification {
  userId: string;       // suscriptor que recibe el aviso
  userEmail: string;
  ticketId: string;
  ticketTitle: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
}

// Contrato que cumple todo canal de notificación.
// Cualquier INotifier puede reemplazar a otro (sustitución de Liskov).
export interface INotifier {
  send(notification: Notification): Promise<void>;
}