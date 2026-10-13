import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import type { Permission } from '../types/index.ts';

interface ProtectedRouteProps {
  permission?: Permission; // si se indica, además de la sesión se exige este permiso
  children?: ReactNode;    // sin hijos, renderiza las rutas anidadas (<Outlet />)
}

// Redirige al login si no hay sesión
export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="page-message">Cargando…</p>;
  }

  if (!user) {
    // Se recuerda a qué página quería ir para volver después del login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="card">
        <h2>Acceso denegado</h2>
        <p>Tu rol no tiene el permiso <code>{permission}</code>.</p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
