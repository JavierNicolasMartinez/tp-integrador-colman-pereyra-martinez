import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import { getRoleLabel } from '../types/index.ts';
import { Can } from './Can.tsx';
import { NotificationBell } from './NotificationBell.tsx';

// Íconos decorativos de los links (el texto del link ya los describe)
function NavIcon({ path }: { path: string }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICON_TICKETS = 'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z M10 5v14';
const ICON_INBOX = 'M4 13l2.5-7h11L20 13 M4 13v5h16v-5 M4 13h4.5l1.5 2.5h4l1.5-2.5H20';
const ICON_USERS = 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M21 19v-1a4 4 0 0 0-3-3.87 M16 4.13a3 3 0 0 1 0 5.74';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/tickets" className="brand">
          Mesa de Ayuda
        </Link>

        <nav className="navbar-links" aria-label="Principal">
          <NavLink to="/tickets">
            <NavIcon path={ICON_TICKETS} /> Tickets
          </NavLink>
          <Can permission="notification:read">
            <NavLink to="/notifications">
              <NavIcon path={ICON_INBOX} /> Notificaciones
            </NavLink>
          </Can>
          <Can permission="user:read">
            <NavLink to="/admin/users">
              <NavIcon path={ICON_USERS} /> Usuarios
            </NavLink>
          </Can>
        </nav>

        <div className="navbar-user">
          <Can permission="notification:read">
            <NotificationBell />
          </Can>
          <span className="navbar-email">
            {user.email} <span className="role-tag">{getRoleLabel(user.role)}</span>
          </span>
          <button type="button" className="button light small" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
