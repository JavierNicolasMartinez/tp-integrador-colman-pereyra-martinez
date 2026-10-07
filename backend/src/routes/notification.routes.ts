import { Router, type RequestHandler } from 'express';
import type { NotificationController } from '../controllers/NotificationController.ts';
import { authorize } from '../middlewares/authorize.ts';

// Las dependencias llegan por parámetro desde main.ts (composition root)
export function createNotificationRoutes(
  controller: NotificationController,
  authenticate: RequestHandler
): Router {
  const router = Router();

  router.use(authenticate, authorize('notification:read'));

  router.get('/', controller.list);
  router.get('/unread-count', controller.unreadCount);
  router.patch('/read-all', controller.markAllAsRead);
  router.patch('/:id/read', controller.markAsRead);

  return router;
}
