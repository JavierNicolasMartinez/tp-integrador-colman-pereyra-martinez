import { Router, type RequestHandler } from 'express';
import type { SubscriptionController } from '../controllers/SubscriptionController.ts';
import { authorize } from '../middlewares/authorize.ts';

// Las dependencias llegan por parámetro desde main.ts (composition root)
export function createSubscriptionRoutes(
  controller: SubscriptionController,
  authenticate: RequestHandler
): Router {
  const router = Router();

  router.use(authenticate);

  // Consultar suscripciones propias solo requiere poder ver tickets
  router.get('/', authorize('ticket:read'), controller.list);
  router.get('/:ticketId', authorize('ticket:read'), controller.status);
  router.post('/', authorize('subscription:create'), controller.subscribe);
  router.delete('/:ticketId', authorize('subscription:delete'), controller.unsubscribe);

  return router;
}
