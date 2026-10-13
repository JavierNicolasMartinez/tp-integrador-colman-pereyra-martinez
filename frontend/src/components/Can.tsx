import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { Permission } from '../types/index.ts';

interface CanProps {
  permission: Permission;
  children: ReactNode;
}

// Muestra los hijos solo si el usuario tiene el permiso.
// Uso: <Can permission="ticket:create"><button>Nuevo</button></Can>
export function Can({ permission, children }: CanProps) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <>{children}</> : null;
}
