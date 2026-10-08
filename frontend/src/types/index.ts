// Tipos compartidos del frontend: reflejan las respuestas JSON del backend

export type TicketStatus = 'ABIERTO' | 'EN_PROGRESO' | 'RESUELTO' | 'CERRADO';

export const TICKET_STATUSES: TicketStatus[] = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  ABIERTO: 'Abierto',
  EN_PROGRESO: 'En progreso',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};

// Permisos con formato recurso:accion (tabla de RF2)
export type Permission =
  | 'ticket:read'
  | 'ticket:create'
  | 'ticket:update'
  | 'ticket:change-status'
  | 'ticket:delete'
  | 'subscription:create'
  | 'subscription:delete'
  | 'notification:read'
  | 'user:read'
  | 'user:assign-role';

export type RoleName = 'admin' | 'operador' | 'usuario';

export const ROLE_NAMES: RoleName[] = ['admin', 'operador', 'usuario'];

// Etiquetas legibles de los roles. Solo para mostrar: al backend viaja siempre el valor de RoleName
export const ROLE_LABELS: Record<RoleName, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  usuario: 'Usuario',
};

export function isRoleName(value: string): value is RoleName {
  return (ROLE_NAMES as string[]).includes(value);
}

// El backend devuelve el rol como string: si no es un rol conocido, se muestra tal cual
export function getRoleLabel(role: string): string {
  return isRoleName(role) ? ROLE_LABELS[role] : role;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketInput {
  title: string;
  description: string;
}

export interface Subscription {
  id: string;
  userId: string;
  ticketId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  ticketId: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: string;
}
