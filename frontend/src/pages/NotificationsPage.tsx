import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { listNotifications, markAllAsRead, markAsRead } from '../api/notifications.api.ts';
import { refreshNotificationBell } from '../components/NotificationBell.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import type { AppNotification } from '../types/index.ts';
import { formatDate } from '../utils/format.ts';

// Bandeja de notificaciones del usuario logueado (RF5)
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    listNotifications()
      .then(setNotifications)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleMarkAsRead(id: string) {
    try {
      const updated = await markAsRead(id);
      setNotifications((current) => current.map((n) => (n.id === id ? updated : n)));
      refreshNotificationBell();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
      setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
      refreshNotificationBell();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <section>
      <div className="page-header">
        <h1>
          Notificaciones {unreadCount > 0 && <span className="muted">({unreadCount} sin leer)</span>}
        </h1>
        <div className="actions">
          <button type="button" className="button secondary" onClick={load}>
            Actualizar
          </button>
          <button type="button" className="button" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {loading && <p className="page-message">Cargando notificaciones…</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && notifications.length === 0 && (
        <p className="page-message">
          No tenés notificaciones. Suscribite a un ticket para enterarte cuando cambie de estado.
        </p>
      )}

      <ul className="notification-list">
        {notifications.map((notification) => (
          <li key={notification.id} className={`card notification ${notification.isRead ? 'read' : 'unread'}`}>
            <div>
              <p className="notification-message">{notification.message}</p>
              <p className="muted small">
                <StatusBadge status={notification.previousStatus} /> → <StatusBadge status={notification.newStatus} />
                {' · '}
                {formatDate(notification.createdAt)}
              </p>
            </div>
            <div className="actions">
              <Link to={`/tickets/${notification.ticketId}`} className="button secondary small">
                Ver ticket
              </Link>
              {!notification.isRead && (
                <button type="button" className="button small" onClick={() => void handleMarkAsRead(notification.id)}>
                  Marcar leída
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
