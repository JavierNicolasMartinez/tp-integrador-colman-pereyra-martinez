import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode; // descripción de lo que va a pasar
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal de confirmación con el diseño de la app (reemplaza window.confirm).
// Usa <dialog> con showModal(): el navegador atrapa el foco, bloquea el fondo y cierra con Escape.
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus(); // en acciones destructivas, el foco arranca en la opción segura
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`confirm-dialog ${tone}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onCancel={(event) => {
        // Escape: se cierra desde el estado de React para que no quede desincronizado
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        // Clic en el fondo oscuro (fuera de la tarjeta)
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="confirm-card">
        <span className="confirm-icon" aria-hidden="true">
          {tone === 'danger' ? (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 7h16 M10 11v6 M14 11v6 M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12 M9 7V4h6v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 8v5 M12 16.5v.5 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <h2 id={`${id}-title`} className="confirm-title">
          {title}
        </h2>
        <div id={`${id}-description`} className="confirm-message">
          {children}
        </div>
        <div className="confirm-actions">
          <button ref={cancelRef} type="button" className="button secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={`button${tone === 'danger' ? ' danger-solid' : ''}`} onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
