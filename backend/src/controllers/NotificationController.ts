import type { Request, Response } from 'express';
import { requireUser } from '../middlewares/authenticate.ts';
import type { NotificationService } from '../services/NotificationService.ts';

type IdParams = { id: string };

// Solo recibe la request, valida la entrada y devuelve la respuesta.
// Cada usuario ve y marca únicamente sus propias notificaciones.
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const user = requireUser(req);
    res.status(200).json(await this.notificationService.listForUser(user.id));
  };

  // Para el contador de la campanita (el frontend lo consulta por polling)
  unreadCount = async (req: Request, res: Response): Promise<void> => {
    const user = requireUser(req);
    res.status(200).json({ count: await this.notificationService.countUnread(user.id) });
  };

  markAsRead = async (req: Request<IdParams>, res: Response): Promise<void> => {
    const user = requireUser(req);
    res.status(200).json(await this.notificationService.markAsRead(req.params.id, user.id));
  };

  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    const user = requireUser(req);
    res.status(200).json({ updated: await this.notificationService.markAllAsRead(user.id) });
  };
}
