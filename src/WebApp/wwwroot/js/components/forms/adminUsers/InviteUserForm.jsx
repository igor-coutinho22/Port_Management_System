const KNOWN_ROLES = ["Admin", "Officer", "Operator", "Representative"];
const INVITE_URL = "/admin/users/invite";

function InviteUserForm({ onDone }) {
    const [email, setEmail] = React.useState("");
    const [displayName, setDisplayName] = React.useState("");
    const [role, setRole] = React.useState("Representative");
    const [msg, setMsg] = React.useState(null);
    const [busy, setBusy] = React.useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setMsg(null);
        setBusy(true);
        try {
            const body = { email, displayName, role };
            await apiService.post(INVITE_URL, body);
            setMsg("The user has received an email with an activation link.");
            setEmail(""); setDisplayName("");
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
                <h4>Add User</h4>
                <p>Send an invitation to a new user with an activation link.</p>
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
            </div>
            <div className="form-actions">
                <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send invite"}</button>
            </div>
            {msg && <p className="info">{msg}</p>}
        </form>
    );
}

window.InviteUserForm = InviteUserForm;
