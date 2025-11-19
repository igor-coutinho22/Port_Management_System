function UpdateUserRolesForm({ onDone }) {
    const [email, setEmail] = React.useState("");
    const [selectedRoles, setSelectedRoles] = React.useState([]);
    const [msg, setMsg] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [loadingUser, setLoadingUser] = React.useState(false);

    const toggleRole = (role) => {
        setSelectedRoles((prev) =>
            prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role]
        );
    };

    const loadUserRoles = async () => {
        setMsg(null);
        if (!email.trim()) {
            setMsg("Enter the email to load existing roles.");
            return;
        }
        setLoadingUser(true);
        try {
            const url = `${UPDATE_ROLES_URL}/${encodeURIComponent(email)}`;
            const data = await apiService.get(url);   // expects { email, displayName, roles: [...] }
            const roles = Array.isArray(data.roles) ? data.roles : [];
            setSelectedRoles(roles);
            setMsg(`Loaded roles for ${data.displayName || data.email}.`);
        } catch (err) {
            setMsg(err?.message || "Failed to load user roles.");
            setSelectedRoles([]);
        } finally {
            setLoadingUser(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setMsg(null);

        if (!email.trim()) {
            setMsg("Email is required.");
            return;
        }
        if (selectedRoles.length === 0) {
            setMsg("Select at least one role.");
            return;
        }

        setBusy(true);
        try {
            const body = { roles: selectedRoles };
            const url = `${UPDATE_ROLES_URL}/${encodeURIComponent(email)}/roles`;
            await apiService.put(url, body);
            setMsg("User roles updated successfully.");
            onDone?.();
        } catch (err) {
            setMsg(err?.message || "Failed to update roles.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="form-container">
            <div className="form-header">
                <h4>Update User Roles</h4>
                <p>Assign or update the internal roles for an existing user.</p>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="btn-small"
                            onClick={loadUserRoles}
                            disabled={loadingUser}
                        >
                            {loadingUser ? "Loading…" : "Load roles"}
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Roles <span className="required">*</span></label>
                    <div className="roles-checkbox-group">
                        {KNOWN_ROLES.map((role) => (
                            <label key={role} className="checkbox-inline">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => toggleRole(role)}
                                />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="form-actions">
                <button className="btn" disabled={busy}>
                    {busy ? "Saving…" : "Save roles"}
                </button>
            </div>
            {msg && <p className="info">{msg}</p>}
        </form>
    );
}

window.UpdateUserRolesForm = UpdateUserRolesForm;
  