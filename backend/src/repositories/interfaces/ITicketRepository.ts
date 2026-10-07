import type { TicketStatus } from '../../models/Ticket.ts';

// Datos planos que devuelve el repositorio: los services no dependen de Mongoose
export interface TicketRecord {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTicketData {
  title: string;
  description: string;
}

// Edición (RF3): el estado NO se cambia acá, tiene su propio método y permiso
export interface UpdateTicketData {
  title?: string;
  description?: string;
}

export interface ITicketRepository {
  findAll(): Promise<TicketRecord[]>;
  findById(id: string): Promise<TicketRecord | null>;
  create(data: CreateTicketData): Promise<TicketRecord>;
  update(id: string, data: UpdateTicketData): Promise<TicketRecord | null>;
  updateStatus(id: string, status: TicketStatus): Promise<TicketRecord | null>;
  delete(id: string): Promise<boolean>; // true si existía y se eliminó
}