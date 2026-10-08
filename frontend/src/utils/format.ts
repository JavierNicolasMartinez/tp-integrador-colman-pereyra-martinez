// Fecha legible en formato argentino, ej: 07/10/2026, 14:58
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
