const KNOWN_ROLES = ["Admin", "Officer", "Operator", "Representative"];
const CREATE_URL = "/admin/users";

function CreateUserForm({ onDone }) {
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
            setMsg((err?.message || err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="form-container">
            <div className="form-header">
                <h4>Create User</h4>
                <p>Create a new user account directly.</p>
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
                    <label>Password <span className="required">*</span></label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
                </div>
            </div>
            <div className="form-actions">
                <button className="btn" disabled={busy}>{busy ? "Creating…" : "Create user"}</button>
            </div>
            {msg && <p className="info">{msg}</p>}
        </form>
    );
}

window.CreateUserForm = CreateUserForm;
