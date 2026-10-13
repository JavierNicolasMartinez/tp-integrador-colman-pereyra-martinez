import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { listTickets } from '../api/tickets.api.ts';
import { Can } from '../components/Can.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { Select, type SelectOption } from '../components/Select.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { STATUS_LABELS, TICKET_STATUSES, type Ticket, type TicketStatus } from '../types/index.ts';
import { formatDate } from '../utils/format.ts';

const FILTER_OPTIONS: SelectOption<TicketStatus | ''>[] = [
  { value: '', label: 'Todos los estados' },
  ...TICKET_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status], tone: status.toLowerCase() })),
];

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
      <PageHeader
        eyebrow="Soporte"
        title="Tickets"
        subtitle="Seguí cada solicitud de soporte, desde que se abre hasta que se cierra."
      >
        <Can permission="ticket:create">
          <Link to="/tickets/new" className="button">
            + Nuevo ticket
          </Link>
        </Can>
      </PageHeader>

      <div className="toolbar">
        <div className="field-inline">
          <span className="field-label">Estado</span>
          <Select
            ariaLabel="Filtrar por estado"
            value={statusFilter}
            options={FILTER_OPTIONS}
            onChange={setStatusFilter}
          />
        </div>
        {!loading && !error && (
          <span className="count-chip">
            {visibleTickets.length} {visibleTickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {loading && <p className="page-message">Cargando tickets…</p>}
      {error && <p className="alert error" role="alert">{error}</p>}

      {!loading && !error && visibleTickets.length === 0 && (
        <p className="page-message">No hay tickets{statusFilter ? ' con ese estado' : ''}.</p>
      )}

      {visibleTickets.length > 0 && (
        <div className="card table-card glow-violet">
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
