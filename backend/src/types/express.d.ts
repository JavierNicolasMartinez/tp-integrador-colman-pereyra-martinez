import type { AuthUser } from '../services/AuthService.ts';

// Agrega req.user al tipo Request de Express. Lo completa el middleware authenticate.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
