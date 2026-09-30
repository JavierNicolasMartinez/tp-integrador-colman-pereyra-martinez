// Datos planos que devuelve el repositorio: los services no dependen de Mongoose
export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  roleId: string;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  roleId: string;
}

export interface IUserRepository {
  findAll(): Promise<UserRecord[]>;
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: CreateUserData): Promise<UserRecord>;
  updateRole(userId: string, roleId: string): Promise<UserRecord | null>;
}
