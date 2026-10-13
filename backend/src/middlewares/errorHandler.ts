import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/HttpError.ts';

// Único lugar donde los errores se convierten en respuestas HTTP.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // JSON mal formado en el body (lo lanza express.json())
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
}
