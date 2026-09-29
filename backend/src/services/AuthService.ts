import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { HttpError } from '../errors/HttpError.ts';
import type { IUserRepository, UserRecord } from '../repositories/interfaces/IUserRepository.ts';
import type { IRoleRepository, RoleRecord } from '../repositories/interfaces/IRoleRepository.ts';

const DEFAULT_ROLE = 'usuario';
const SALT_ROUNDS = 10;

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresInSeconds: number;
}

// Lo que se guarda dentro del JWT
export interface TokenPayload {
  sub: string; // id del usuario
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export class AuthService {
  // Depende de interfaces, no de implementaciones (inversión de dependencias)
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly config: AuthConfig
  ) {}

  async register(email: string, password: string): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new HttpError(409, 'El email ya está registrado');
    }

    // Todo usuario nuevo se registra con el rol "usuario" (RF2)
    const role = await this.roleRepository.findByName(DEFAULT_ROLE);
    if (!role) {
      throw new HttpError(500, `No existe el rol "${DEFAULT_ROLE}". ¿Se ejecutó el seed?`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.userRepository.create({ email, passwordHash, roleId: role.id });

    return this.buildAuthResult(user, role);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);

    // Mismo mensaje en ambos casos para no revelar qué emails están registrados
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new HttpError(401, 'Email o contraseña incorrectos');
    }

    const role = await this.roleRepository.findById(user.roleId);
    if (!role) {
      throw new HttpError(500, 'El usuario tiene asignado un rol inexistente');
    }

    return this.buildAuthResult(user, role);
  }

  // Lo usa el middleware authenticate: así solo este service conoce el secreto del JWT
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret);
      if (typeof decoded === 'object' && typeof decoded.sub === 'string') {
        return { sub: decoded.sub };
      }
    } catch {
      // Firma inválida o token vencido: se responde 401 abajo
    }
    throw new HttpError(401, 'Token inválido o vencido');
  }

  private buildAuthResult(user: UserRecord, role: RoleRecord): AuthResult {
    const payload: TokenPayload = { sub: user.id };
    const token = jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresInSeconds
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: role.name,
        permissions: role.permissions
      }
    };
  }
}
