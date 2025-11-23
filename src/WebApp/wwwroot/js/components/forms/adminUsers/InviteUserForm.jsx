function InviteUserForm({ onDone }) {
    const [email, setEmail] = React.useState("");
    const [displayName, setDisplayName] = React.useState("");
    const [selectedRoles, setSelectedRoles] = React.useState(["Representative"]); // default
    const [msg, setMsg] = React.useState(null);
    const [busy, setBusy] = React.useState(false);

    const toggleRole = (role) => {
        setSelectedRoles((prev) =>
            prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role]
        );
    };

    const submit = async (e) => {
        e.preventDefault();
        setMsg(null);
        if (selectedRoles.length === 0) {
            setMsg("Select at least one role.");
            return;
        }
        setBusy(true);
        try {
            const body = { email, displayName, roles: selectedRoles };
            await apiService.post(INVITE_URL, body);
            setMsg("The user has received an email with an activation link.");
            setEmail("");
            setDisplayName("");
            setSelectedRoles(["Representative"]);
            onDone?.();
        } catch (err) {
            setMsg(err?.message || String(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="form-container">
            <div className="form-header">
                <h4 style={{ marginBottom: 0 }}>Add User</h4>
                <p style={{ marginTop: 4, marginBottom: 18, color: '#b0b8c1' }}>Send an invitation to a new user with an activation link.</p>
            </div>
            <div className="form-grid" style={{ gap: 24 }}>
                <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        style={{ marginBottom: 0 }}
                    />
                </div>
                <div className="form-group">
                    <label>Display name <span className="required">*</span></label>
                    <input
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="form-input"
                        style={{ marginBottom: 0 }}
                    />
                </div>
                <div className="form-group">
                    <label>Roles <span className="required">*</span></label>
                    <div className="roles-checkbox-group" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
                        {KNOWN_ROLES.map((role) => (
                            <label key={role} className="checkbox-inline" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => toggleRole(role)}
                                    style={{ marginRight: 4 }}
                                />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="form-actions" style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button className="submit-btn" disabled={busy}>
                    {busy ? "Sending…" : <><span>✉️</span> Send invite</>}
                </button>
            </div>
            {msg && <div className={`message ${msg.includes('error') ? 'error' : 'info'}`}>{msg}</div>}
        </form>
    );
}

window.InviteUserForm = InviteUserForm;
  