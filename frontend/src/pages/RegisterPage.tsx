import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { getErrorMessage } from '../api/client.ts';
import { AppFrame } from '../components/AppFrame.tsx';
import { FieldError } from '../components/FieldError.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useFieldErrors } from '../utils/useFieldErrors.ts';

const MIN_PASSWORD_LENGTH = 6;

export function RegisterPage() {
  const { user, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate, setFieldError, clearError, fieldProps } = useFieldErrors();

  if (user) {
    return <Navigate to="/tickets" replace />;
  }

  async function handleSubmit() {
    setError(null);

    // El largo mínimo ya lo valida useFieldErrors con el atributo minLength
    if (password !== confirmPassword) {
      setFieldError('confirmPassword', 'Las contraseñas no coinciden.');
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
        <h1 className="hero-title">Crear cuenta</h1>
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
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <FieldError name="password" message={errors.password} />
        </label>
        <label>
          Repetir contraseña
          <input
            {...fieldProps('confirmPassword')}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError('confirmPassword');
            }}
            required
          />
          <FieldError name="confirmPassword" message={errors.confirmPassword} />
        </label>

        {error && <p className="alert error" role="alert">{error}</p>}

        <button type="submit" className="button" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Registrarme'}
        </button>

        <p className="muted">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </AppFrame>
  );
}
