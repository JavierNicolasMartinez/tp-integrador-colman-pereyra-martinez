import { isValidObjectId } from 'mongoose';
import Ticket, { type ITicket, type TicketStatus } from '../models/Ticket.ts';
import type {
  CreateTicketData,
  ITicketRepository,
  TicketRecord,
  UpdateTicketData
} from './interfaces/ITicketRepository.ts';

// Convierte el documento de Mongoose en datos planos para los services
function toTicketRecord(doc: ITicket): TicketRecord {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export class TicketRepository implements ITicketRepository {
  async findAll(): Promise<TicketRecord[]> {
    const docs = await Ticket.find().sort({ createdAt: -1 }); // los más nuevos primero
    return docs.map(toTicketRecord);
  }

  async findById(id: string): Promise<TicketRecord | null> {
    // Un id con formato inválido se trata como "no existe" (404) y no como error 500
    if (!isValidObjectId(id)) return null;

    const doc = await Ticket.findById(id);
    return doc ? toTicketRecord(doc) : null;
  }

  async create(data: CreateTicketData): Promise<TicketRecord> {
    const doc = await Ticket.create({ title: data.title, description: data.description });
    return toTicketRecord(doc);
  }

  async update(id: string, data: UpdateTicketData): Promise<TicketRecord | null> {
    if (!isValidObjectId(id)) return null;

    const doc = await Ticket.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: 'after', runValidators: true }
    );
    return doc ? toTicketRecord(doc) : null;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<TicketRecord | null> {
    if (!isValidObjectId(id)) return null;

    const doc = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    );
    return doc ? toTicketRecord(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;

    const doc = await Ticket.findByIdAndDelete(id);
    return doc !== null;
  }
}