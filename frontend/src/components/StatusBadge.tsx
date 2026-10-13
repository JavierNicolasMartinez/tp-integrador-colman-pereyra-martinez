import { STATUS_LABELS, type TicketStatus } from '../types/index.ts';

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`status status-${status.toLowerCase()}`}>{STATUS_LABELS[status]}</span>;
}
