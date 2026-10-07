import type { Request, Response } from 'express';
import { requireUser } from '../middlewares/authenticate.ts';
import type { SubscriptionService } from '../services/SubscriptionService.ts';

type TicketParams = { ticketId: string };

function parseTicketId(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;

  const { ticketId } = body as Record<string, unknown>;
  return typeof ticketId === 'string' && ticketId.trim() !== '' ? ticketId.trim() : null;
}

// Solo recibe la request, valida la entrada y devuelve la respuesta.
// La lógica de negocio está en SubscriptionService.
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Suscripciones del usuario logueado
  list = async (req: Request, res: Response): Promise<void> => {
    const user = requireUser(req);
    res.status(200).json(await this.subscriptionService.listForUser(user.id));
  };

  // ¿El usuario logueado está suscripto a este ticket?
  status = async (req: Request<TicketParams>, res: Response): Promise<void> => {
    const user = requireUser(req);
    const subscribed = await this.subscriptionService.isSubscribed(user.id, req.params.ticketId);
    res.status(200).json({ subscribed });
  };

  subscribe = async (req: Request, res: Response): Promise<void> => {
    const user = requireUser(req);

    const ticketId = parseTicketId(req.body);
    if (!ticketId) {
      res.status(400).json({ message: 'El campo "ticketId" es obligatorio' });
      return;
    }

    res.status(201).json(await this.subscriptionService.subscribe(user.id, ticketId));
  };

  unsubscribe = async (req: Request<TicketParams>, res: Response): Promise<void> => {
    const user = requireUser(req);
    await this.subscriptionService.unsubscribe(user.id, req.params.ticketId);
    res.status(204).send();
  };
}
