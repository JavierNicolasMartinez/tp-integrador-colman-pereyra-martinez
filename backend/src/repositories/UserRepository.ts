import User, { type IUser } from '../models/User.ts';
import type { CreateUserData, IUserRepository, UserRecord } from './interfaces/IUserRepository.ts';

// Convierte el documento de Mongoose en datos planos para los services
function toUserRecord(doc: IUser): UserRecord {
  return {
    id: String(doc._id),
    email: doc.email,
    passwordHash: doc.password,
    roleId: String(doc.role)
  };
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserRecord | null> {
    const doc = await User.findById(id);
    return doc ? toUserRecord(doc) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const doc = await User.findOne({ email });
    return doc ? toUserRecord(doc) : null;
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    const doc = await User.create({
      email: data.email,
      password: data.passwordHash,
      role: data.roleId
    });
    return toUserRecord(doc);
  }
}
