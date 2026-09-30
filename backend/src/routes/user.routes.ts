import { Router, type RequestHandler } from 'express';
import type { UserController } from '../controllers/UserController.ts';
import { authorize } from '../middlewares/authorize.ts';

// Las dependencias llegan por parámetro desde main.ts (composition root)
export function createUserRoutes(controller: UserController, authenticate: RequestHandler): Router {
  const router = Router();

  // Todas las rutas de usuarios requieren estar logueado
  router.use(authenticate);

  router.get('/', authorize('user:read'), controller.list);
  router.patch('/:id/role', authorize('user:assign-role'), controller.assignRole);

  return router;
}
