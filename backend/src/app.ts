import cors from 'cors';
import express, { type Express, type Router } from 'express';
import { HttpError } from './errors/HttpError.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

export interface AppRouters {
  auth: Router;
  users: Router;
  tickets: Router;
  subscriptions: Router;
  notifications: Router;
}

// Arma la aplicación Express. No crea dependencias: recibe los routers ya armados
// desde main.ts (composition root).
export function createApp(routers: AppRouters): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', routers.auth);
  app.use('/api/users', routers.users);
  app.use('/api/tickets', routers.tickets);
  app.use('/api/subscriptions', routers.subscriptions);
  app.use('/api/notifications', routers.notifications);

  // Cualquier otra ruta: 404 en formato JSON
  app.use((_req, _res, next) => {
    next(new HttpError(404, 'Ruta no encontrada'));
  });

  // Siempre al final
  app.use(errorHandler);

  return app;
}
