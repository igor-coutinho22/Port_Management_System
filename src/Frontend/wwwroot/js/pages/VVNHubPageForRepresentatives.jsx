// Vessel Visit Notifications Hub Page (Representatives View)
console.log('VVNHubPageForRepresentatives.jsx is loading...');

const VVNHubPageForRepresentatives = () => {
    const { t } = useTranslation();
    
    // 1. Get User Context (Crucial for Organization ID)
    const { 
        currentUser: user,       
        isLoadingUser: userLoading 
    } = useUser(); 

    const [expandedSection, setExpandedSection] = React.useState(null); 
    const [notifications, setNotifications] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    // Default to true for reps, or false if you prefer matching the admin page exactly
    const [showQuickView, setShowQuickView] = React.useState(true); 

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // 2. Load Notifications Logic (Specific to Representative)
    const loadNotifications = React.useCallback(async () => {
        // Guard: Need user and org ID
        if (!user || !user.organizationId) return;

        setIsLoading(true);
        try {
            // Representative API Call
            const data = await window.apiService.getVesselVisitNotificationsByOrganization(user.organizationId);
            setNotifications(data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotifications([]); 
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // 3. Effect: Load data when Quick View is open and User is ready
    React.useEffect(() => {
        if (!userLoading && user?.organizationId && showQuickView) {
            loadNotifications();
        }
    }, [showQuickView, userLoading, user, loadNotifications]);

    // 4. Sections Configuration (Easy to add more later)
    const sections = [
        {
            id: 'submit',
            title: t('vesselVisitNotificationsHubPage.section.submit.title'),
            description: t('vesselVisitNotificationsHubPage.section.submit.description'),
            color: '#16a085', // Teal color for Submit
            component: 'SubmitVesselVisitNotificationForm'
        }
        // Future sections (Edit, View, etc.) can be added here easily
    ];

    // Loading State for User Context
    if (userLoading) {
        return <div className="loading">{t('loading')}</div>;
    }

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
                                <p>Your user account is not linked to an organization.</p>
                            </div>
                        ) : (
                            <VVNRepresentativeQuickTable 
                                notifications={notifications} 
                                onRefresh={loadNotifications} 
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Swagger-style Expandable Sections */}
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
                                    {/* Component Rendering Logic */}
                                    {section.component === 'SubmitVesselVisitNotificationForm' && (
                                        <SubmitVesselVisitNotificationForm onSuccess={loadNotifications} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// Specific Quick Table for the Representative view (Resilient to 403s)
// ----------------------------------------------------------------------
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
            } catch (err) { console.warn("Could not load vessels:", err); }

            // 2. Fetch Docks (Safe)
            try {
                const d = await window.apiService.getDocks();
                setDocks(d || []);
            } catch (err) { console.warn("Could not load docks:", err); }

            // 3. Fetch Organizations (Catch 403 Forbidden for Reps)
            try {
                const orgs = await window.apiService.getOrganizations(true); 
                setShippingAgentOrganizations(orgs || []);
            } catch (err) { console.warn("Could not load organizations (Expected for Reps):", err); }
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