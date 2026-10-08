import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const MIN_PASSWORD_LENGTH = 6;

export function RegisterPage() {
  const { user, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/tickets" replace />;
  }

  async function handleSubmit() {
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      // Todo usuario nuevo se registra con el rol "usuario" (lo asigna el backend)
      await register(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form
        className="card auth-card"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <h1>Crear cuenta</h1>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
        </label>
        <label>
          Repetir contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="alert error">{error}</p>}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <p className="muted">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </div>
  );
}
