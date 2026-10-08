import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getUnreadCount } from '../api/notifications.api.ts';

const POLL_INTERVAL_MS = 5000;
const REFRESH_EVENT = 'notifications:refresh';

// Para que otras pantallas actualicen el contador al instante
// (por ejemplo, al marcar notificaciones como leídas)
export function refreshNotificationBell(): void {
  window.dispatchEvent(new Event(REFRESH_EVENT));
}

// Contador de notificaciones no leídas, actualizado por polling cada 5 segundos
export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const refresh = () => {
      getUnreadCount()
        .then((unread) => {
          if (active) setCount(unread);
        })
        .catch(() => {
          // Si falla una consulta, se reintenta en el próximo ciclo
        });
    };

    refresh();
    const intervalId = window.setInterval(refresh, POLL_INTERVAL_MS);
    window.addEventListener(REFRESH_EVENT, refresh);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener(REFRESH_EVENT, refresh);
    };
  }, []);

  return (
    <Link to="/notifications" className="bell" title="Notificaciones" aria-label={`${count} notificaciones sin leer`}>
      <span aria-hidden="true">🔔</span>
      {count > 0 && <span className="bell-count">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
