const AdminUsersPage = () => {
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [error, setError] = React.useState(null);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = search ? `${LIST_URL}?q=${encodeURIComponent(search)}` : LIST_URL;
            const data = await apiService.get(url);
            setUsers(Array.isArray(data) ? data : (data?.items || []));
        } catch (e) {
            setError(e?.message || "Failed to load users.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => { loadUsers(); }, []);

    const sections = [
        {
            id: "invite",
            title: "Invite User",
            description: "Send an invitation to a new user.",
            color: "#27ae60",
            component: <InviteUserForm onDone={loadUsers} />
        },
        {
            id: "create",
            title: "Create User",
            description: "Create a new user account directly.",
            color: "#f39c12",
            component: <CreateUserForm onDone={loadUsers} />
        },
        {
            id: "list",
            title: "Users List",
            description: "View, search, and manage users.",
            color: "#3498db",
            component: (
                <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search (email/name)…" className="form-input" />
                        <button className="btn-small" onClick={loadUsers}>Search</button>
                    </div>
                    {isLoading ? (
                        <div className="loading">Loading users…</div>
                    ) : error ? (
                        <div className="error" style={{ color: "crimson" }}>{error}</div>
                    ) : (
                        <UsersQuickTable users={users} onReload={loadUsers} />
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">👤 Admin — User Management</h2>
                <p>Create or invite users, resend invites, enable/disable accounts.</p>
            </div>

            <div className="operations-container">
                {sections.map(section => (
                    <div className="operation-section" key={section.id}>
                        <div
                            className={`operation-header ${expandedSection === section.id ? "expanded" : ""}`}
                            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                            style={{ borderLeftColor: section.color }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">{section.title}</h3>
                                <p className="operation-description">{section.description}</p>
                            </div>
                            <div className="operation-controls">
                                <span className="http-method" style={{ backgroundColor: section.color }}>
                                    {section.id.toUpperCase()}
                                </span>
                                <span className={`expand-arrow ${expandedSection === section.id ? "up" : "down"}`}>
                                    {expandedSection === section.id ? "▲" : "▼"}
                                </span>
                            </div>
                        </div>
                        {expandedSection === section.id && (
                            <div className="operation-content">
                                <div className="operation-body">{section.component}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

window.AdminUsersPage = AdminUsersPage;
