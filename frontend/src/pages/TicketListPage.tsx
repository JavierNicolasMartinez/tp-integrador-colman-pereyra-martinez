import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { listTickets } from '../api/tickets.api.ts';
import { Can } from '../components/Can.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { STATUS_LABELS, TICKET_STATUSES, type Ticket, type TicketStatus } from '../types/index.ts';
import { formatDate } from '../utils/format.ts';

export function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTickets()
      .then(setTickets)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const visibleTickets = statusFilter ? tickets.filter((ticket) => ticket.status === statusFilter) : tickets;

  return (
    <section>
      <div className="page-header">
        <h1>Tickets</h1>
        <Can permission="ticket:create">
          <Link to="/tickets/new" className="button">
            + Nuevo ticket
          </Link>
        </Can>
      </div>

      <div className="toolbar">
        <label className="inline">
          Estado:
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}>
            <option value="">Todos</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="page-message">Cargando tickets…</p>}
      {error && <p className="alert error">{error}</p>}

      {!loading && !error && visibleTickets.length === 0 && (
        <p className="page-message">No hay tickets{statusFilter ? ' con ese estado' : ''}.</p>
      )}

      {visibleTickets.length > 0 && (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estado</th>
                <th>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {visibleTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="muted">{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
