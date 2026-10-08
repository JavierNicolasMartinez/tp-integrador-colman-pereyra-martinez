import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { createTicket, getTicket, updateTicket } from '../api/tickets.api.ts';
import { FieldError } from '../components/FieldError.tsx';
import { useFieldErrors } from '../utils/useFieldErrors.ts';

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

// Sirve para crear (/tickets/new) y para editar (/tickets/:id/edit)
export function TicketFormPage() {
  const { id } = useParams();
  const isEditing = id !== undefined;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, validate, clearError, fieldProps } = useFieldErrors();

  // En modo edición se cargan los datos actuales del ticket
  useEffect(() => {
    if (!id) return;
    getTicket(id)
      .then((ticket) => {
        setTitle(ticket.title);
        setDescription(ticket.description);
      })
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const data = { title: title.trim(), description: description.trim() };
      const saved = id ? await updateTicket(id, data) : await createTicket(data);
      navigate(`/tickets/${saved.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page-message">Cargando ticket…</p>;

  return (
    <section>
      <Link to={id ? `/tickets/${id}` : '/tickets'} className="back-link">
        ← Volver
      </Link>

      <form
        className="card form glow-warm"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (validate(event.currentTarget)) void handleSubmit();
        }}
      >
        <h1 className="hero-title">{isEditing ? 'Editar ticket' : 'Nuevo ticket'}</h1>

        <label>
          Título
          <input
            {...fieldProps('title')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            maxLength={MAX_TITLE_LENGTH}
            required
            autoFocus
          />
          <FieldError name="title" message={errors.title} />
        </label>
        <label>
          Descripción
          <textarea
            {...fieldProps('description')}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearError('description');
            }}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={5}
            required
          />
          <FieldError name="description" message={errors.description} />
        </label>

        {!isEditing && <p className="muted small">Los tickets nuevos se crean con estado Abierto.</p>}
        {error && <p className="alert error" role="alert">{error}</p>}

        <div className="actions">
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </section>
  );
}
