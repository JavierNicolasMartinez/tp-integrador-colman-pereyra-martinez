import { HttpError } from '../errors/HttpError.ts';
import type { IUserRepository, UserRecord } from '../repositories/interfaces/IUserRepository.ts';
import type { IRoleRepository } from '../repositories/interfaces/IRoleRepository.ts';

// Lo que ve el administrador: nunca incluye el hash de la contraseña
export interface UserSummary {
  id: string;
  email: string;
  role: string;
}

function toUserSummary(user: UserRecord, roleName: string): UserSummary {
  return { id: user.id, email: user.email, role: roleName };
}

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  // RF6: el administrador lista los usuarios
  async listUsers(): Promise<UserSummary[]> {
    // Se traen los roles una sola vez, en vez de hacer una consulta por cada usuario
    const [users, roles] = await Promise.all([
      this.userRepository.findAll(),
      this.roleRepository.findAll()
    ]);

    const roleNames = new Map(roles.map((role) => [role.id, role.name]));
    return users.map((user) => toUserSummary(user, roleNames.get(user.roleId) ?? 'sin rol'));
  }

  // RF6: el administrador asigna un rol a un usuario
  async assignRole(userId: string, roleName: string, currentUserId: string): Promise<UserSummary> {
    // Evita que el admin se saque su propio rol y se quede sin acceso
    if (userId === currentUserId) {
      throw new HttpError(400, 'No podés cambiar tu propio rol');
    }

    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new HttpError(400, `El rol "${roleName}" no existe`);
    }

    const user = await this.userRepository.updateRole(userId, role.id);
    if (!user) {
      throw new HttpError(404, 'Usuario no encontrado');
    }

    return toUserSummary(user, role.name);
  }
}
