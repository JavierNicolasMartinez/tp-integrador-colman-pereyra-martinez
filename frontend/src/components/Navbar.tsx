import { Link, NavLink } from 'react-router';
import { useAuth } from '../context/AuthContext.tsx';
import { Can } from './Can.tsx';
import { NotificationBell } from './NotificationBell.tsx';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/tickets" className="brand">
          Mesa de Ayuda
        </Link>

        <nav className="navbar-links">
          <NavLink to="/tickets">Tickets</NavLink>
          <Can permission="notification:read">
            <NavLink to="/notifications">Notificaciones</NavLink>
          </Can>
          <Can permission="user:read">
            <NavLink to="/admin/users">Usuarios</NavLink>
          </Can>
        </nav>

        <div className="navbar-user">
          <Can permission="notification:read">
            <NotificationBell />
          </Can>
          <span className="navbar-email">
            {user.email} <span className="role-tag">{user.role}</span>
          </span>
          <button type="button" className="button secondary small" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
