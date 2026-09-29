import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpError } from '../errors/HttpError.ts';
import type { AuthService } from '../services/AuthService.ts';

const BEARER_PREFIX = 'Bearer ';

// Recibe el AuthService por parámetro: se crea una sola vez en main.ts
export function createAuthenticate(authService: AuthService): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new HttpError(401, 'Falta el token de autenticación');
    }

    const token = header.slice(BEARER_PREFIX.length);
    req.user = await authService.getUserFromToken(token);
    next();
  };
}
