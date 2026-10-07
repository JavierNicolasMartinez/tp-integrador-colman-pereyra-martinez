import type { Request, Response } from 'express';
import { TICKET_STATUSES, type TicketStatus } from '../models/Ticket.ts';
import type { CreateTicketData, UpdateTicketData } from '../repositories/interfaces/ITicketRepository.ts';
import type { TicketService } from '../services/TicketService.ts';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

type IdParams = { id: string };

// --- Validación de la entrada (sin any: el body llega como unknown) ---

function asObject(body: unknown): Record<string, unknown> | null {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null;
}

// Devuelve el texto limpio o un mensaje de error
function parseText(value: unknown, field: string, maxLength: number): string | { error: string } {
  if (typeof value !== 'string' || value.trim() === '') {
    return { error: `El campo "${field}" es obligatorio` };
  }
  if (value.trim().length > maxLength) {
    return { error: `El campo "${field}" admite como máximo ${maxLength} caracteres` };
  }
  return value.trim();
}

function parseCreate(body: unknown): CreateTicketData | { error: string } {
  const data = asObject(body);
  if (!data) return { error: 'El cuerpo de la petición es obligatorio' };

  const title = parseText(data['title'], 'title', MAX_TITLE_LENGTH);
  if (typeof title !== 'string') return title;

  const description = parseText(data['description'], 'description', MAX_DESCRIPTION_LENGTH);
  if (typeof description !== 'string') return description;

  return { title, description };
}

function parseUpdate(body: unknown): UpdateTicketData | { error: string } {
  const data = asObject(body);
  if (!data) return { error: 'El cuerpo de la petición es obligatorio' };

  const result: UpdateTicketData = {};

  if (data['title'] !== undefined) {
    const title = parseText(data['title'], 'title', MAX_TITLE_LENGTH);
    if (typeof title !== 'string') return title;
    result.title = title;
  }

  if (data['description'] !== undefined) {
    const description = parseText(data['description'], 'description', MAX_DESCRIPTION_LENGTH);
    if (typeof description !== 'string') return description;
    result.description = description;
  }

  if (result.title === undefined && result.description === undefined) {
    return { error: 'Hay que enviar "title" y/o "description"' };
  }
  return result;
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === 'string' && (TICKET_STATUSES as readonly string[]).includes(value);
}

// Solo recibe la request, valida la entrada y devuelve la respuesta.
// La lógica de negocio está en TicketService.
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.ticketService.list());
  };

  getById = async (req: Request<IdParams>, res: Response): Promise<void> => {
    res.status(200).json(await this.ticketService.getById(req.params.id));
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const data = parseCreate(req.body);
    if ('error' in data) {
      res.status(400).json({ message: data.error });
      return;
    }
    res.status(201).json(await this.ticketService.create(data));
  };

  update = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const data = parseUpdate(req.body);
    if ('error' in data) {
      res.status(400).json({ message: data.error });
      return;
    }
    res.status(200).json(await this.ticketService.update(req.params.id, data));
  };

  changeStatus = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const status = asObject(req.body)?.['status'];
    if (!isTicketStatus(status)) {
      res.status(400).json({ message: `El campo "status" debe ser uno de: ${TICKET_STATUSES.join(', ')}` });
      return;
    }
    res.status(200).json(await this.ticketService.changeStatus(req.params.id, status));
  };

  delete = async (req: Request<IdParams>, res: Response): Promise<void> => {
    await this.ticketService.delete(req.params.id);
    res.status(204).send();
  };
}
