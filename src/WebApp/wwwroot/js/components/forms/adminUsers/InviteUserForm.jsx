const KNOWN_ROLES = ["Admin", "Officer", "Operator", "Representative"];
const INVITE_URL = "/admin/users/invite";

function InviteUserForm({ onDone }) {
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
        <form onSubmit={submit} className="form-container">
            <div className="form-header">
                <h4>Invite User</h4>
                <p>Send an invitation to a new user.</p>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Display name <span className="required">*</span></label>
                    <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                    <label>Role <span className="required">*</span></label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
                        {KNOWN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Temp password <span style={{ opacity: .6 }}>(optional)</span></label>
                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
                </div>
            </div>
            <div className="form-actions">
                <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send invite"}</button>
            </div>
            {msg && <p className="info">{msg}</p>}
        </form>
    );
}

window.InviteUserForm = InviteUserForm;
