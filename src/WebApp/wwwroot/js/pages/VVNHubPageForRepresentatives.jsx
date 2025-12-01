// Vessel Visit Notifications Hub Page (Representatives View) - Swagger-style expandable interface
console.log('VVNHubPageForRepresentatives.jsx is loading...');

const VVNHubPageForRepresentatives = () => {
    const { t } = useTranslation();
    const { 
        currentUser: user,       // Map 'currentUser' (from Context) to 'user' (for this file)
        isLoadingUser: userLoading // Map 'isLoadingUser' (from Context) to 'userLoading'
    } = useUser();
    // --- ADD THIS DEBUGGING BLOCK ---
    console.log("Current User Object:", user);
    console.log("Organization ID Check:", user?.organizationId);
    // --------------------------------
    const [expandedSection, setExpandedSection] = React.useState(null); // Default to open for better UX
    const [notifications, setNotifications] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(true); // Default to true for representatives

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // This effect will run when the component mounts and whenever organizationId or showQuickView changes.
    // It fetches notifications only when a valid organizationId is available.
    React.useEffect(() => {
        const loadNotifications = async () => {
            // Do not fetch if the user is still loading, if there's no organizationId, or if the view is hidden
            if (userLoading || !user?.organizationId || !showQuickView) {
                setNotifications([]); // Clear notifications if conditions aren't met
                return;
            }

            setIsLoading(true);
            try {
                const data = await window.apiService.getVesselVisitNotificationsByOrganization(user.organizationId);
                setNotifications(data);
            } catch (error) {
                console.error('Error loading notifications:', error);
                setNotifications([]); // Set to empty on error
            } finally {
                setIsLoading(false);
            }
        };

        loadNotifications();
    }, [user?.organizationId, userLoading, showQuickView]); // Dependency array

    if (userLoading) {
        return <div className="loading">{t('loading')}</div>;
    }

    // Filtered sections - ONLY Submit is included
    const sections = [
        {
            id: 'submit',
            title: t('vesselVisitNotificationsHubPage.section.submit.title'),
            description: t('vesselVisitNotificationsHubPage.section.submit.description'),
            color: '#16a085',
            component: 'SubmitVesselVisitNotificationForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('vesselVisitNotificationsHubPage.title')} <span className="role-badge">Representative</span>
                </h2>
                <p>{t('vesselVisitNotificationsHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('vesselVisitNotificationsHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('vesselVisitNotificationsHubPage.quickView.loading')}</div>
                        ) : !user?.organizationId ? (
                            <div className="no-data error-panel">
                                <h3>Organization Not Found</h3>
                                <p>Your user account is not linked to an organization. Please contact an administrator.</p>
                            </div>
                        ) : (
                            <VVNRepresentativeQuickTable notifications={notifications} onRefresh={() => {}} />
                        )}
                    </div>
                )}
            </div>

            {/* Swagger-style Expandable Sections (Submit Only) */}
            <div className="operations-container">
                {sections.map((section) => (
                    <div key={section.id} className="operation-section">
                        <div
                            className={`operation-header ${expandedSection === section.id ? 'expanded' : ''}`}
                            onClick={() => toggleSection(section.id)}
                            style={{ borderLeftColor: section.color }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">{section.title}</h3>
                                <p className="operation-description">{section.description}</p>
                            </div>
                            <div className="operation-controls">
                                <span
                                    className="http-method"
                                    style={{ backgroundColor: section.color }}
                                >
                                    {section.id.toUpperCase()}
                                </span>
                                <span className={`expand-arrow ${expandedSection === section.id ? 'up' : 'down'}`}>
                                    {expandedSection === section.id ? '▲' : '▼'}
                                </span>
                            </div>
                        </div>

                        {expandedSection === section.id && (
                            <div className="operation-content">
                                <div className="operation-body">
                                    {section.component === 'SubmitVesselVisitNotificationForm' && <SubmitVesselVisitNotificationForm onSuccess={() => {}} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Specific Quick Table for the Representative view to avoid name conflicts.
// Specific Quick Table for the Representative view
const VVNRepresentativeQuickTable = ({ notifications, onRefresh }) => {
    const { t } = useTranslation();
    const [vessels, setVessels] = React.useState([]);
    const [docks, setDocks] = React.useState([]);
    const [shippingAgentOrganizations, setShippingAgentOrganizations] = React.useState([]);

    React.useEffect(() => {
        async function fetchMeta() {
            // 1. Fetch Vessels (Safe)
            try {
                const v = await window.apiService.getVessels();
                setVessels(v || []);
            } catch (err) {
                console.warn("Could not load vessels:", err);
            }

            // 2. Fetch Docks (Safe)
            try {
                const d = await window.apiService.getDocks();
                setDocks(d || []);
            } catch (err) {
                console.warn("Could not load docks:", err);
            }

            // 3. Fetch Organizations (Safe & Restricted)
            try {
                // Representatives might get a 403 here. We catch it so the app doesn't crash.
                const orgs = await window.apiService.getOrganizations(true);
                setShippingAgentOrganizations(orgs || []);
            } catch (err) {
                console.warn("Could not load organizations (Expected if Representative):", err);
                // We leave the list empty. The table will just show the ID instead of the Name.
            }
        }
        fetchMeta();
    }, []);

    function getVesselName(imo) {
        const vessel = vessels.find(v => v.imo === imo);
        return vessel ? vessel.vesselName || vessel.name || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
    }
    function getDockName(id) {
        const dock = docks.find(d => d.id === id);
        return dock ? dock.name || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
    }
    function getOrganizationLegalName(id) {
        const org = shippingAgentOrganizations.find(o => o.id === id);
        return org ? org.legalName || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
    }

    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('vesselVisitNotificationsHubPage.quickView.overview')} ({notifications.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('vesselVisitNotificationsHubPage.quickView.refresh')}</button>
            </div>
            {notifications.length === 0 ? (
                <div className="no-data">
                    <h3>{t('vesselVisitNotificationsHubPage.quickView.noData.title')}</h3>
                    <p>{t('vesselVisitNotificationsHubPage.quickView.noData.description')}</p>
                    {/* DEBUG: Remove this line after testing */}
                    <p style={{fontSize: '0.8em', color: '#666'}}>Debug: API called, result is empty.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('vesselVisitNotificationsHubPage.table.id')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.vesselImo')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.dockId')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.visitDate')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.status')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.purpose')}</th>
                                <th>{t('vesselVisitNotificationsHubPage.table.organization')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((n) => (
                                <tr key={n.id}>
                                    <td className="id-cell">{n.id}</td>
                                    <td>{n.vesselIMO ? `${n.vesselIMO} (${getVesselName(n.vesselIMO)})` : '-'}</td>
                                    <td>{n.dockId ? `${n.dockId} (${getDockName(n.dockId)})` : '-'}</td>
                                    <td>{n.visitDate ? new Date(n.visitDate).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <span className={`status-badge status-${(n.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {n.status}
                                        </span>
                                    </td>
                                    <td>{n.purpose}</td>
                                    <td>{getOrganizationLegalName(n.shippingAgentOrganizationId)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('VVNHubPageForRepresentatives component loaded!');