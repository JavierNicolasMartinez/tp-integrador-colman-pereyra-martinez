import { pathToFileURL } from 'node:url';
import bcrypt from 'bcrypt';
import Permission from '../models/Permission.ts';
import Role from '../models/Role.ts';
import User from '../models/User.ts';
import { DatabaseConnection } from './DatabaseConnection.ts';

// El seed usa los modelos directamente: es un script de carga inicial que prepara
// la base antes de que la aplicación funcione, no forma parte del flujo
// routes → controllers → services → repositories.

const PERMISSIONS = [
  { name: 'ticket:read', description: 'Ver tickets' },
  { name: 'ticket:create', description: 'Crear tickets' },
  { name: 'ticket:update', description: 'Editar tickets' },
  { name: 'ticket:change-status', description: 'Cambiar el estado de un ticket' },
  { name: 'ticket:delete', description: 'Eliminar tickets' },
  { name: 'subscription:create', description: 'Suscribirse a un ticket' },
  { name: 'subscription:delete', description: 'Desuscribirse de un ticket' },
  { name: 'notification:read', description: 'Ver sus notificaciones' },
  { name: 'user:read', description: 'Listar usuarios' },
  { name: 'user:assign-role', description: 'Asignar un rol a un usuario' }
] as const;

type PermissionName = (typeof PERMISSIONS)[number]['name'];

// Tabla de permisos por rol de la consigna (RF2)
const ROLES: Record<string, PermissionName[]> = {
  admin: PERMISSIONS.map((permission) => permission.name),
  operador: [
    'ticket:read',
    'ticket:create',
    'ticket:update',
    'ticket:change-status',
    'subscription:create',
    'subscription:delete',
    'notification:read'
  ],
  usuario: ['ticket:read', 'subscription:create', 'subscription:delete', 'notification:read']
};

// Usuarios de prueba (documentados en el README)
const TEST_USERS = [
  { email: 'admin@tp.com', password: 'admin123', role: 'admin' },
  { email: 'operador@tp.com', password: 'operador123', role: 'operador' },
  { email: 'usuario@tp.com', password: 'usuario123', role: 'usuario' }
] as const;

const SALT_ROUNDS = 10;

// Se puede ejecutar varias veces: actualiza permisos y roles, y solo crea
// los usuarios de prueba que todavía no existen.
export async function seedDatabase(): Promise<void> {
  // 1. Permisos
  for (const { name, description } of PERMISSIONS) {
    await Permission.updateOne({ name }, { $set: { description } }, { upsert: true });
  }
  const permissions = await Permission.find({ name: { $in: PERMISSIONS.map((p) => p.name) } });
  const permissionIds = new Map(permissions.map((permission) => [permission.name, permission._id]));

  // 2. Roles con sus permisos
  for (const [roleName, permissionNames] of Object.entries(ROLES)) {
    const ids = permissionNames.map((name) => permissionIds.get(name));
    await Role.updateOne({ name: roleName }, { $set: { permissions: ids } }, { upsert: true });
  }
  const roles = await Role.find({ name: { $in: Object.keys(ROLES) } });
  const roleIds = new Map(roles.map((role) => [role.name, role._id]));

  // 3. Usuarios de prueba (si ya existen no se tocan, para no pisar cambios de rol)
  let createdUsers = 0;
  for (const { email, password, role } of TEST_USERS) {
    if (await User.exists({ email })) continue;

    const roleId = roleIds.get(role);
    if (roleId === undefined) {
      throw new Error(`[SEED] No se encontró el rol "${role}"`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ email, password: passwordHash, role: roleId });
    createdUsers++;
  }

  console.log(
    `[SEED] ${PERMISSIONS.length} permisos y ${roles.length} roles listos. ` +
      `Usuarios de prueba creados: ${createdUsers}`
  );
}

// Permite correrlo a mano con: npm run seed
const isRunDirectly =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isRunDirectly) {
  const database = DatabaseConnection.getInstance();
  try {
    await database.connect();
    await seedDatabase();
  } finally {
    await database.disconnect();
  }
}