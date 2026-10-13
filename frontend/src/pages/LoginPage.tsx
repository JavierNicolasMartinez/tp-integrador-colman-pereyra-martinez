import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { AppFrame } from '../components/AppFrame.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { FieldError } from '../components/FieldError.tsx';
import { getRoleLabel, type RoleName } from '../types/index.ts';
import { useFieldErrors } from '../utils/useFieldErrors.ts';

const TEST_USERS: { role: RoleName; email: string; password: string }[] = [
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
  const { errors, validate, clearError, fieldProps } = useFieldErrors();

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
    <AppFrame className="auth-page">
      <form
        className="card auth-card glow-violet"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (validate(event.currentTarget)) void handleSubmit();
        }}
      >
        <span className="chip">
          <span className="chip-icon" aria-hidden="true">✦</span> Mesa de Ayuda
        </span>
        <h1 className="hero-title">Iniciar sesión</h1>
        <p className="auth-subtitle">Gestioná tus tickets de soporte</p>

        <label>
          Correo electrónico
          <input
            {...fieldProps('email')}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError('email');
            }}
            required
            autoFocus
          />
          <FieldError name="email" message={errors.email} />
        </label>
        <label>
          Contraseña
          <input
            {...fieldProps('password')}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError('password');
            }}
            required
          />
          <FieldError name="password" message={errors.password} />
        </label>

        {error && <p className="alert error" role="alert">{error}</p>}

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
                clearError('email');
                clearError('password');
              }}
            >
              {getRoleLabel(testUser.role)}
            </button>
          ))}
        </div>
      </form>
    </AppFrame>
  );
}
