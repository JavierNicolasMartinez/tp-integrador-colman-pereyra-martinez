import type { Request, Response } from 'express';
import { HttpError } from '../errors/HttpError.ts';
import type { UserService } from '../services/UserService.ts';

// Valida el body de la asignación de rol sin usar any
function parseRoleName(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;

  const { role } = body as Record<string, unknown>;
  if (typeof role !== 'string' || role.trim() === '') return null;

  return role.trim().toLowerCase();
}

// Solo recibe la request, valida la entrada y devuelve la respuesta.
// La lógica de negocio está en UserService.
export class UserController {
  constructor(private readonly userService: UserService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const users = await this.userService.listUsers();
    res.status(200).json(users);
  };

  assignRole = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    // req.user lo completa el middleware authenticate
    if (!req.user) {
      throw new HttpError(401, 'No autenticado');
    }

    const roleName = parseRoleName(req.body);
    if (!roleName) {
      res.status(400).json({ message: 'El campo "role" es obligatorio' });
      return;
    }

    const user = await this.userService.assignRole(req.params.id, roleName, req.user.id);
    res.status(200).json(user);
  };
}
