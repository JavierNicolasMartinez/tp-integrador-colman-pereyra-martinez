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
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: CreateUserData): Promise<UserRecord>;
}
