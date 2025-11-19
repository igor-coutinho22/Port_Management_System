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
                <h4>Add User</h4>
                <p>Send an invitation to a new user with an activation link.</p>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Display name <span className="required">*</span></label>
                    <input
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="form-input"
                    />
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
                    {busy ? "Sending…" : "Send invite"}
                </button>
            </div>
            {msg && <p className="info">{msg}</p>}
        </form>
    );
}

window.InviteUserForm = InviteUserForm;
  