import { Router, type RequestHandler } from 'express';
import type { AuthController } from '../controllers/AuthController.ts';

// Las dependencias llegan por parámetro desde main.ts (composition root)
export function createAuthRoutes(controller: AuthController, authenticate: RequestHandler): Router {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.get('/me', authenticate, controller.me);

  return router;
}
