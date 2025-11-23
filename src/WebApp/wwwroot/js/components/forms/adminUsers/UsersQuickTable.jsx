const RESEND_URL = (id) => `/admin/users/${encodeURIComponent(id)}/resend-invite`;
const DISABLE_URL = (id) => `/admin/users/${encodeURIComponent(id)}/disable`;
const ENABLE_URL = (id) => `/admin/users/${encodeURIComponent(id)}/enable`;

function UsersQuickTable({ users, onReload }) {
    const [busyId, setBusyId] = React.useState(null);

    const toggleEnabled = async (u) => {
        try {
            setBusyId(u.id);
            const endpoint = u.enabled === false ? ENABLE_URL(u.id) : DISABLE_URL(u.id);
            await apiService.post(endpoint, {});
            await onReload?.();
        } catch (e) {
            alert("Action failed: " + (e?.message || e));
        } finally {
            setBusyId(null);
        }
    };

    const resend = async (u) => {
        try {
            setBusyId(u.id);
            await apiService.post(RESEND_URL(u.id), {});
            alert("Invite re-sent.");
        } catch (e) {
            alert("Failed: " + (e?.message || e));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="quick-table-container">
            <div className="quick-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ margin: 0 }}>Users <span style={{ color: '#b0b8c1', fontWeight: 400 }}>({users.length})</span></h4>
                <button className="refresh-btn" onClick={onReload} style={{ minWidth: 90 }}>🔄 Refresh</button>
            </div>
            <div className="table-container" style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}>
                <table className="data-table quick-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#192a3a' }}>
                        <tr>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Role(s)</th>
                            <th>Enabled</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(users || []).map(u => (
                            <tr key={u.id || u.email} style={{ borderBottom: '1px solid #22334a' }}>
                                <td>{u.email || u.userPrincipalName || "-"}</td>
                                <td>{u.displayName || "-"}</td>
                                <td>{Array.isArray(u.roles) ? u.roles.join(", ") : (u.role || "-")}</td>
                                <td>
                                    <span className={`status-badge status-${u.enabled ? "active" : "inactive"}`} style={{ fontWeight: 600, padding: '4px 12px', borderRadius: 6, fontSize: '0.98em' }}>
                                        {u.enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </td>
                                <td style={{ display: "flex", gap: 8, alignItems: 'center' }}>
                                    <button className="action-btn" onClick={() => resend(u)} title="Resend invite" disabled={busyId !== null} style={{ minWidth: 32 }}>
                                        <span role="img" aria-label="resend">✉️</span>
                                    </button>
                                    <button className="action-btn" onClick={() => toggleEnabled(u)} title="Enable/Disable" disabled={busyId !== null} style={{ minWidth: 32 }}>
                                        {u.enabled ? <span role="img" aria-label="disable">🚫</span> : <span role="img" aria-label="enable">✅</span>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

window.UsersQuickTable = UsersQuickTable;
