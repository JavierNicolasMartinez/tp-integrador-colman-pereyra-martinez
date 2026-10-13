import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpError } from '../errors/HttpError.ts';

// Uso: router.post('/', authenticate, authorize('ticket:create'), controller.create)
// La validación de permisos se hace acá, en el backend: sin permiso responde 403
// aunque el endpoint se llame directo desde Postman o curl.
export function authorize(permission: string): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, 'No autenticado');
    }

    if (!req.user.permissions.includes(permission)) {
      throw new HttpError(403, `No tenés el permiso ${permission}`);
    }

    next();
  };
}
