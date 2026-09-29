import Role from '../models/Role.ts';
import Permission, { type IPermission } from '../models/Permission.ts';
import type { IRoleRepository, RoleRecord } from './interfaces/IRoleRepository.ts';

interface PopulatedRole {
  _id: unknown;
  name: string;
  permissions: IPermission[];
}

// El rol guarda ids de permisos: se devuelven solo sus nombres (ej: 'ticket:read')
function toRoleRecord(doc: PopulatedRole): RoleRecord {
  return {
    id: String(doc._id),
    name: doc.name,
    permissions: doc.permissions.map((permission) => permission.name)
  };
}

// Se indica el modelo explícitamente para que Permission quede registrado en Mongoose
const populatePermissions = { path: 'permissions', model: Permission };

export class RoleRepository implements IRoleRepository {
  async findByName(name: string): Promise<RoleRecord | null> {
    const doc = await Role.findOne({ name }).populate<{ permissions: IPermission[] }>(populatePermissions);
    return doc ? toRoleRecord(doc) : null;
  }

  async findById(id: string): Promise<RoleRecord | null> {
    const doc = await Role.findById(id).populate<{ permissions: IPermission[] }>(populatePermissions);
    return doc ? toRoleRecord(doc) : null;
  }
}
