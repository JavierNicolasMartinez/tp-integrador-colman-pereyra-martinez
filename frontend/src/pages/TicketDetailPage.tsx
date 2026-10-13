import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { isSubscribed, subscribe, unsubscribe } from '../api/subscriptions.api.ts';
import { changeTicketStatus, deleteTicket, getTicket } from '../api/tickets.api.ts';
import { Can } from '../components/Can.tsx';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { refreshNotificationBell } from '../components/NotificationBell.tsx';
import { Select, type SelectOption } from '../components/Select.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { STATUS_LABELS, TICKET_STATUSES, type Ticket, type TicketStatus } from '../types/index.ts';
import { formatDate } from '../utils/format.ts';

export function TicketDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    Promise.all([getTicket(id), isSubscribed(id)])
      .then(([loadedTicket, isUserSubscribed]) => {
        setTicket(loadedTicket);
        setSubscribed(isUserSubscribed);
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Ejecuta una acción mostrando el resultado y evitando dobles clics
  async function run(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await action();
      setSuccess(successMessage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const handleSubscribe = () =>
    run(async () => {
      await subscribe(id);
      setSubscribed(true);
    }, 'Te suscribiste: vas a recibir una notificación cada vez que cambie el estado.');

  const handleUnsubscribe = () =>
    run(async () => {
      await unsubscribe(id);
      setSubscribed(false);
    }, 'Ya no vas a recibir notificaciones de este ticket.');

  const handleChangeStatus = () => {
    if (!newStatus) return;
    return run(async () => {
      setTicket(await changeTicketStatus(id, newStatus));
      setNewStatus('');
      refreshNotificationBell(); // por si el propio usuario está suscripto
    }, `Estado actualizado a ${STATUS_LABELS[newStatus]}. Se notificó a los suscriptores.`);
  };

  const handleDelete = async () => {
    await run(async () => {
      await deleteTicket(id);
      navigate('/tickets', { replace: true });
    }, 'Ticket eliminado');
    setConfirmingDelete(false); // si falló, se cierra el modal y se ve el error en la página
  };

  if (loading) return <p className="page-message">Cargando ticket…</p>;

  if (!ticket) {
    return (
      <section>
        <p className="alert error">{error ?? 'Ticket no encontrado'}</p>
        <Link to="/tickets">← Volver a tickets</Link>
      </section>
    );
  }

  const statusOptions: SelectOption<TicketStatus | ''>[] = [
    { value: '', label: 'Elegir estado…' },
    ...TICKET_STATUSES.filter((status) => status !== ticket.status).map((status) => ({
      value: status,
      label: STATUS_LABELS[status],
      tone: status.toLowerCase(),
    })),
  ];

  return (
    <section>
      <Link to="/tickets" className="back-link">
        ← Volver a tickets
      </Link>

      <div className="card glow-violet detail-card">
        <div className="page-header">
          <h1 className="hero-title">{ticket.title}</h1>
          <StatusBadge status={ticket.status} />
        </div>
        <p className="description">{ticket.description}</p>
        <p className="muted small">
          Creado: {formatDate(ticket.createdAt)} · Actualizado: {formatDate(ticket.updatedAt)}
        </p>

        {error && <p className="alert error" role="alert">{error}</p>}
        {success && <p className="alert success" role="status">{success}</p>}

        <div className="actions">
          {subscribed ? (
            <Can permission="subscription:delete">
              <button type="button" className="button secondary" onClick={handleUnsubscribe} disabled={busy}>
                Desuscribirme
              </button>
            </Can>
          ) : (
            <Can permission="subscription:create">
              <button type="button" className="button" onClick={handleSubscribe} disabled={busy}>
                Suscribirme
              </button>
            </Can>
          )}

          <Can permission="ticket:update">
            <Link to={`/tickets/${ticket.id}/edit`} className="button secondary">
              Editar
            </Link>
          </Can>

          <Can permission="ticket:delete">
            <button type="button" className="button danger" onClick={() => setConfirmingDelete(true)} disabled={busy}>
              Eliminar
            </button>
          </Can>
        </div>

        <Can permission="ticket:change-status">
          <div className="status-change">
            <div className="field-inline">
              <span className="field-label">Cambiar estado</span>
              <Select ariaLabel="Nuevo estado" value={newStatus} options={statusOptions} onChange={setNewStatus} />
            </div>
            <button type="button" className="button" onClick={handleChangeStatus} disabled={busy || !newStatus}>
              Aplicar
            </button>
          </div>
        </Can>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        tone="danger"
        title="¿Eliminar este ticket?"
        confirmLabel={busy ? 'Eliminando…' : 'Sí, eliminar'}
        busy={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmingDelete(false)}
      >
        <p>
          Vas a eliminar <strong>{ticket.title}</strong>. También se borran sus suscripciones y notificaciones.
        </p>
        <p className="muted">Esta acción no se puede deshacer.</p>
      </ConfirmDialog>
    </section>
  );
}
