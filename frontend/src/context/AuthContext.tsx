import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth.api.ts';
import { setAuthToken, setUnauthorizedHandler } from '../api/client.ts';
import type { AuthResponse, AuthUser, Permission } from '../types/index.ts';

const TOKEN_KEY = 'token';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean; // true mientras se recupera la sesión guardada
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): void;
  hasPermission(permission: Permission): boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Guarda el usuario logueado y sus permisos para toda la aplicación
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const startSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    setAuthToken(response.token);
    setUser(response.user);
  }, []);

  // Al abrir la app: si hay un token guardado, se recupera la sesión con /auth/me
  useEffect(() => {
    setUnauthorizedHandler(logout); // token vencido -> se cierra la sesión

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);
    authApi
      .me()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [startSession],
  );

  const register = useCallback(
    async (email: string, password: string) => startSession(await authApi.register(email, password)),
    [startSession],
  );

  // Ocultar botones es solo un complemento: el backend valida cada permiso (403)
  const hasPermission = useCallback(
    (permission: Permission) => user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, hasPermission }),
    [user, loading, login, register, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
