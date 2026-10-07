import { Router, type RequestHandler } from 'express';
import type { TicketController } from '../controllers/TicketController.ts';
import { authorize } from '../middlewares/authorize.ts';

// Las dependencias llegan por parámetro desde main.ts (composition root)
export function createTicketRoutes(controller: TicketController, authenticate: RequestHandler): Router {
  const router = Router();

  // Todas las rutas de tickets requieren estar logueado
  router.use(authenticate);

  router.get('/', authorize('ticket:read'), controller.list);
  router.get('/:id', authorize('ticket:read'), controller.getById);
  router.post('/', authorize('ticket:create'), controller.create);
  router.put('/:id', authorize('ticket:update'), controller.update);
  router.patch('/:id/status', authorize('ticket:change-status'), controller.changeStatus);
  router.delete('/:id', authorize('ticket:delete'), controller.delete);

  return router;
}
