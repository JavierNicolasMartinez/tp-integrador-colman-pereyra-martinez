import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { AdminUsersPage } from './pages/AdminUsersPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { TicketDetailPage } from './pages/TicketDetailPage.tsx';
import { TicketFormPage } from './pages/TicketFormPage.tsx';
import { TicketListPage } from './pages/TicketListPage.tsx';

// Definición de rutas. Cada página exige el mismo permiso que su endpoint en el backend.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Todo lo de adentro requiere sesión iniciada */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute permission="ticket:read">
              <TicketListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/new"
          element={
            <ProtectedRoute permission="ticket:create">
              <TicketFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute permission="ticket:read">
              <TicketDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id/edit"
          element={
            <ProtectedRoute permission="ticket:update">
              <TicketFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute permission="notification:read">
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute permission="user:read">
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}

export default App;
