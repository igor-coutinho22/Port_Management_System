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
            <div className="quick-table-header">
                <h4>Users ({users.length})</h4>
                <button className="refresh-btn" onClick={onReload}>Refresh</button>
            </div>
            <div className="table-container">
                <table className="data-table quick-table">
                    <thead>
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
                            <tr key={u.id || u.email}>
                                <td>{u.email || u.userPrincipalName || "-"}</td>
                                <td>{u.displayName || "-"}</td>
                                <td>{Array.isArray(u.roles) ? u.roles.join(", ") : (u.role || "-")}</td>
                                <td>
                                    <span className={`status-badge status-${u.enabled ? "active" : "inactive"}`}>
                                        {u.enabled ? "Enabled" : "Disabled"}
                                    </span>
                                </td>
                                <td style={{ display: "flex", gap: 6 }}>
                                    <button className="action-btn" onClick={() => resend(u)} title="Resend invite" disabled={busyId !== null}></button>
                                    <button className="action-btn" onClick={() => toggleEnabled(u)} title="Enable/Disable" disabled={busyId !== null}>
                                        {u.enabled ? "disabled" : "enabled"}
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
