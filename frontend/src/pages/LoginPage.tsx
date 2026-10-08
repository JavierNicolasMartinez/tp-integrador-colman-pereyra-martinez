import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { useAuth } from '../context/AuthContext.tsx';

const TEST_USERS = [
  { role: 'admin', email: 'admin@tp.com', password: 'admin123' },
  { role: 'operador', email: 'operador@tp.com', password: 'operador123' },
  { role: 'usuario', email: 'usuario@tp.com', password: 'usuario123' },
];

// Página a la que quería ir el usuario antes de que lo mandaran al login
function getRedirectPath(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return state.from;
  }
  return '/tickets';
}

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Con la sesión iniciada no tiene sentido mostrar el login
  if (user) {
    return <Navigate to={getRedirectPath(location.state)} replace />;
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
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
        <h1>Iniciar sesión</h1>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {error && <p className="alert error">{error}</p>}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="muted">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>

        <div className="test-users">
          <p className="muted">Usuarios de prueba (clic para completar):</p>
          {TEST_USERS.map((testUser) => (
            <button
              key={testUser.email}
              type="button"
              className="button secondary small"
              onClick={() => {
                setEmail(testUser.email);
                setPassword(testUser.password);
              }}
            >
              {testUser.role}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
