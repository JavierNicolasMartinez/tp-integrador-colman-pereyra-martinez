import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client.ts';
import { assignRole, listUsers } from '../api/users.api.ts';
import { Can } from '../components/Can.tsx';
import { PageHeader } from '../components/PageHeader.tsx';
import { Select, type SelectOption } from '../components/Select.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { getRoleLabel, isRoleName, ROLE_LABELS, ROLE_NAMES, type RoleName, type UserSummary } from '../types/index.ts';

const ROLE_OPTIONS: SelectOption<RoleName>[] = ROLE_NAMES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
  tone: `role-${role}`,
}));

// RF6: el administrador lista los usuarios y les asigna un rol
export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, RoleName>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err: unknown) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(userId: string, role: RoleName) {
    setSavingId(userId);
    setError(null);
    setSuccess(null);
    try {
      const updated = await assignRole(userId, role);
      setUsers((current) => current.map((u) => (u.id === userId ? updated : u)));
      setSelectedRoles(({ [userId]: _saved, ...rest }) => rest);
      setSuccess(`${updated.email} ahora tiene el rol ${getRoleLabel(updated.role)}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        subtitle="Asigná un rol a cada persona para definir qué puede hacer en la mesa de ayuda."
      />

      {loading && <p className="page-message">Cargando usuarios…</p>}
      {error && <p className="alert error" role="alert">{error}</p>}
      {success && <p className="alert success" role="status">{success}</p>}

      {users.length > 0 && (
        <div className="card table-card glow-violet">
          <table>
            <thead>
              <tr>
                <th>Correo</th>
                <th>Rol</th>
                <Can permission="user:assign-role">
                  <th />
                </Can>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isMe = user.id === currentUser?.id;
                const selected = selectedRoles[user.id] ?? user.role;
                const changed = selected !== user.role;

                return (
                  <tr key={user.id}>
                    <td>
                      {user.email} {isMe && <span className="muted">(vos)</span>}
                    </td>
                    <td>
                      <Can permission="user:assign-role">
                        <Select
                          ariaLabel={`Rol de ${user.email}`}
                          value={selected}
                          options={ROLE_OPTIONS}
                          disabled={isMe}
                          title={isMe ? 'No podés cambiar tu propio rol' : undefined}
                          onChange={(role) => setSelectedRoles((current) => ({ ...current, [user.id]: role }))}
                        />
                      </Can>
                      {/* Sin permiso para asignar, solo se muestra el rol */}
                      {!currentUser?.permissions.includes('user:assign-role') && (
                        <span className="role-tag">{getRoleLabel(user.role)}</span>
                      )}
                    </td>
                    <Can permission="user:assign-role">
                      <td>
                        {changed && isRoleName(selected) && (
                          <button
                            type="button"
                            className="button small"
                            disabled={savingId === user.id}
                            onClick={() => void handleSave(user.id, selected)}
                          >
                            {savingId === user.id ? 'Guardando…' : 'Guardar'}
                          </button>
                        )}
                      </td>
                    </Can>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
