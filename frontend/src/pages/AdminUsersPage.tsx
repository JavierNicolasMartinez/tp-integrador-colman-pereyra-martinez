import { useEffect, useState } from 'react';
import { getErrorMessage } from '../api/client.ts';
import { assignRole, listUsers } from '../api/users.api.ts';
import { Can } from '../components/Can.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ROLE_NAMES, type RoleName, type UserSummary } from '../types/index.ts';

function isRoleName(value: string): value is RoleName {
  return (ROLE_NAMES as string[]).includes(value);
}

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
      setSuccess(`${updated.email} ahora tiene el rol ${updated.role}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>Usuarios</h1>
      </div>

      {loading && <p className="page-message">Cargando usuarios…</p>}
      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {users.length > 0 && (
        <div className="card table-card">
          <table>
            <thead>
              <tr>
                <th>Email</th>
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
                        <select
                          value={selected}
                          disabled={isMe}
                          title={isMe ? 'No podés cambiar tu propio rol' : undefined}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (isRoleName(value)) {
                              setSelectedRoles((current) => ({ ...current, [user.id]: value }));
                            }
                          }}
                        >
                          {ROLE_NAMES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </Can>
                      {/* Sin permiso para asignar, solo se muestra el rol */}
                      {!currentUser?.permissions.includes('user:assign-role') && (
                        <span className="role-tag">{user.role}</span>
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
