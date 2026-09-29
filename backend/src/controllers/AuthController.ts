import type { Request, Response } from 'express';
import type { AuthService } from '../services/AuthService.ts';

interface Credentials {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Valida el body sin usar any: se recibe como unknown y se comprueba cada campo
function parseCredentials(body: unknown): Credentials | string {
  if (typeof body !== 'object' || body === null) {
    return 'El cuerpo de la petición es obligatorio';
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return 'Email y contraseña son obligatorios';
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return 'El email no tiene un formato válido';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }

  return { email: normalizedEmail, password };
}

// Solo recibe la request, valida la entrada y devuelve la respuesta.
// La lógica de negocio (hash, JWT, rol por defecto) está en AuthService.
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Arrow functions para que `this` no se pierda al pasarlas al router.
  // Express 5 manda automáticamente al errorHandler los errores de funciones async.
  register = async (req: Request, res: Response): Promise<void> => {
    const credentials = parseCredentials(req.body);

    if (typeof credentials === 'string') {
      res.status(400).json({ message: credentials });
      return;
    }

    const result = await this.authService.register(credentials.email, credentials.password);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const credentials = parseCredentials(req.body);

    if (typeof credentials === 'string') {
      res.status(400).json({ message: credentials });
      return;
    }

    const result = await this.authService.login(credentials.email, credentials.password);
    res.status(200).json(result);
  };
}
