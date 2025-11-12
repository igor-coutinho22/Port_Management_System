
console.log("👤 AdminUsersPage.jsx loaded (ApiService version)");

(function () {
    if (!window.apiService) {
        console.error("apiService is not available. Make sure wwwroot/js/services/api-service.js is loaded before this page.");
    }

    
    const INVITE_URL = "/admin/users/invite";
    const CREATE_URL = "/admin/users";
    const LIST_URL = "/admin/users";
    const RESEND_URL = (id) => `/admin/users/${encodeURIComponent(id)}/resend-invite`;
    const DISABLE_URL = (id) => `/admin/users/${encodeURIComponent(id)}/disable`;
    const ENABLE_URL = (id) => `/admin/users/${encodeURIComponent(id)}/enable`;

    const KNOWN_ROLES = ["Admin", "Officer", "Operator", "Representative"];

    
    const InviteUserForm = ({ onDone }) => {
        const [email, setEmail] = React.useState("");
        const [displayName, setDisplayName] = React.useState("");
        const [role, setRole] = React.useState("Representative");
        const [password, setPassword] = React.useState("");
        const [busy, setBusy] = React.useState(false);
        const [msg, setMsg] = React.useState(null);

        const submit = async (e) => {
            e.preventDefault();
            setMsg(null);
            setBusy(true);
            try {
                const body = { email, displayName, role };
                if (password.trim()) body.password = password.trim();

                await apiService.post(INVITE_URL, body);
                setMsg("Invitation sent successfully.");
                setEmail(""); setDisplayName(""); setPassword("");
                onDone?.();
            } catch (err) {
                setMsg((err?.message || err));
            } finally {
                setBusy(false);
            }
        };

        return (
            <form onSubmit={submit} className="form-grid">
                <div className="form-row">
                    <label>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-row">
                    <label>Display name</label>
                    <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="form-row">
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        {KNOWN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="form-row">
                    <label>Temp password <span style={{ opacity: .6 }}>(optional)</span></label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-actions">
                    <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send invite"}</button>
                </div>
                {msg && <p className="info">{msg}</p>}
            </form>
        );
    };

    
    const CreateUserForm = ({ onDone }) => {
        const [email, setEmail] = React.useState("");
        const [displayName, setDisplayName] = React.useState("");
        const [role, setRole] = React.useState("Representative");
        const [password, setPassword] = React.useState("");
        const [busy, setBusy] = React.useState(false);
        const [msg, setMsg] = React.useState(null);

        const submit = async (e) => {
            e.preventDefault();
            setMsg(null);
            setBusy(true);
            try {
                await apiService.post(CREATE_URL, { email, displayName, password, role });
                setMsg("User created successfully.");
                setEmail(""); setDisplayName(""); setPassword("");
                onDone?.();
            } catch (err) {
                setMsg( (err?.message || err));
            } finally {
                setBusy(false);
            }
        };

        return (
            <form onSubmit={submit} className="form-grid">
                <div className="form-row">
                    <label>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-row">
                    <label>Display name</label>
                    <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="form-row">
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        {KNOWN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="form-row">
                    <label>Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-actions">
                    <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create user"}</button>
                </div>
                {msg && <p className="info">{msg}</p>}
            </form>
        );
    };


    const UsersQuickTable = ({ users, onReload }) => {
        const [busyId, setBusyId] = React.useState(null);

        const toggleEnabled = async (u) => {
            try {
                setBusyId(u.id);
                const endpoint = u.enabled === false ? ENABLE_URL(u.id) : DISABLE_URL(u.id);
                await apiService.post(endpoint, {}); // backend can ignore body
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
                    <button className="refresh-btn" onClick={onReload}> Refresh</button>
                </div>
                <table className="quick-table">
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
        );
    };

    
    const AdminUsersPage = () => {
        const [expanded, setExpanded] = React.useState("invite");
        const [list, setList] = React.useState([]);
        const [loading, setLoading] = React.useState(false);
        const [q, setQ] = React.useState("");
        const [err, setErr] = React.useState(null);

        const load = async () => {
            setLoading(true);
            setErr(null);
            try {
                const url = q ? `${LIST_URL}?q=${encodeURIComponent(q)}` : LIST_URL;
                const data = await apiService.get(url);
                setList(Array.isArray(data) ? data : (data?.items || []));
            } catch (e) {
                console.error(e);
                setErr(e?.message || "Failed to load users.");
                setList([]);
            } finally {
                setLoading(false);
            }
        };

        React.useEffect(() => { load(); }, []);

        const sections = [
            { id: "invite", title: "Invite user", color: "#27ae60", component: <InviteUserForm onDone={load} /> },
            { id: "create", title: "Create user", color: "#f39c12", component: <CreateUserForm onDone={load} /> },
            {
                id: "list", title: "Users list", color: "#3498db", component:
                    <div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search (email/name)…" />
                            <button className="btn-small" onClick={load}>Search</button>
                        </div>
                        {loading ? (
                            <div className="loading">Loading users…</div>
                        ) : err ? (
                            <div className="error" style={{ color: "crimson" }}>{err}</div>
                        ) : (
                            <UsersQuickTable users={list} onReload={load} />
                        )}
                    </div>
            },
        ];

        return (
            <div className="page-section">
                <div className="hub-header">
                    <h2 className="page-title">👤 Admin — User Management</h2>
                    <p>Create or invite users, resend invites, enable/disable accounts.</p>
                </div>

                <div className="operations-container">
                    {sections.map(sec => (
                        <div className="operation-section" key={sec.id}>
                            <div
                                className={`operation-header ${expanded === sec.id ? "expanded" : ""}`}
                                onClick={() => setExpanded(expanded === sec.id ? null : sec.id)}
                                style={{ borderLeftColor: sec.color }}
                            >
                                <div className="operation-info">
                                    <h3 className="operation-title">{sec.title}</h3>
                                </div>
                                <div className="operation-controls">
                                    <span className="http-method" style={{ backgroundColor: sec.color }}>
                                        {sec.id.toUpperCase()}
                                    </span>
                                    <span className={`expand-arrow ${expanded === sec.id ? "up" : "down"}`}>
                                        {expanded === sec.id ? "▲" : "▼"}
                                    </span>
                                </div>
                            </div>
                            {expanded === sec.id && (
                                <div className="operation-content">
                                    <div className="operation-body">{sec.component}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    window.AdminUsersPage = AdminUsersPage;
})();
