export interface RoleRecord {
  id: string;
  name: string;
  permissions: string[]; // nombres de los permisos, ej: 'ticket:read'
}

export interface IRoleRepository {
  findAll(): Promise<RoleRecord[]>;
  findByName(name: string): Promise<RoleRecord | null>;
  findById(id: string): Promise<RoleRecord | null>;
}
