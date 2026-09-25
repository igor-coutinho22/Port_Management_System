
const KNOWN_ROLES = ["Admin", "Officer", "Operator", "Representative"];
const INVITE_URL = "/admin/users/invite";
const LIST_URL = "/admin/users";
const UPDATE_ROLES_URL = "/admin/users";

window.KNOWN_ROLES = KNOWN_ROLES;



const AdminUsersPage = () => {
    const { t } = useTranslation();
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
            setError(e?.message || t('adminUsersPage.section.list.error'));
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => { loadUsers(); }, []);

    const sections = [
        {
            id: "list",
            title: t('adminUsersPage.section.list.title'),
            description: t('adminUsersPage.section.list.description'),
            color: "#3498db",
            component: (
                <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('adminUsersPage.section.list.search.placeholder')} className="form-input" />
                        <button className="btn-small" onClick={loadUsers}>{t('adminUsersPage.section.list.search.button')}</button>
                    </div>
                    {isLoading ? (
                        <div className="loading">{t('adminUsersPage.section.list.loading')}</div>
                    ) : error ? (
                        <div className="error" style={{ color: "crimson" }}>{error}</div>
                    ) : (
                        <UsersQuickTable users={users} onReload={loadUsers} />
                    )}
                </div>
            )
        },
        {
            id: "add",
            title: t('adminUsersPage.section.add.title'),
            description: t('adminUsersPage.section.add.description'),
            color: "#27ae60",
            component: <InviteUserForm onDone={loadUsers} />
        },
        {
            id: "roles",
            title: t('adminUsersPage.section.roles.title'),
            description: t('adminUsersPage.section.roles.description'),
            color: "#f39c12",
            component: <UpdateUserRolesForm onDone={loadUsers} />
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">{t('adminUsersPage.title')}</h2>
                <p>{t('adminUsersPage.description')}</p>
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
                                    {t(`sectionBadge.${section.id}`, section.id).toUpperCase()}
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
