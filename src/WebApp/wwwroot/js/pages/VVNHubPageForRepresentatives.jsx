// Vessel Visit Notifications Hub Page (Representatives View) - Swagger-style expandable interface
console.log('VVNHubPageForRepresentatives.jsx is loading...');

const VVNHubPageForRepresentatives = () => {
    const { t } = useTranslation();
    const { user } = useUser(); // Get the full user object
    const [expandedSection, setExpandedSection] = React.useState(null); // Default to open for better UX
    const [notifications, setNotifications] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false); // Default to true for representatives
    const [orgIdMissing, setOrgIdMissing] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all notifications for quick view
    const loadNotifications = async () => {
        const organizationId = user?.organizationId;
        if (!organizationId) {
            console.error("CRITICAL: Organization ID not found for the current representative user. The /api/me endpoint might not be populating it.");
            setOrgIdMissing(true);
            return; // Don't fetch if there's no org ID
        }
        setIsLoading(true);
        try {
            const data = await apiService.getVesselVisitNotificationsByOrganization(organizationId);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        // Load notifications if the view is open AND we have an organization ID
        if (showQuickView && user?.organizationId) {
            setOrgIdMissing(false); // Reset missing flag if we have an ID
            loadNotifications();
        }
    }, [showQuickView, user?.organizationId]); // Re-run if user object changes

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
                        ) : orgIdMissing ? (
                            <div className="no-data error-panel">
                                <h3>Organization Not Found</h3>
                                <p>Your user account is not linked to an organization. Please contact an administrator.</p>
                                {/* --- DEBUG PANEL START --- */}
                                <div style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '4px', border: '1px solid #555' }}>
                                    <h4 style={{ color: '#f39c12', margin: '0 0 10px 0' }}>Debugging Info: `user` Object</h4>
                                    <pre style={{ color: 'white', background: 'black', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {JSON.stringify(user, null, 2)}
                                    </pre>
                                    <p style={{ fontSize: '0.9em', color: '#ccc', marginTop: '10px' }}>This panel shows the user data received from the backend. Notice that `organizationId` is missing.</p>
                                </div>
                                {/* --- DEBUG PANEL END --- */}
                            </div>
                        ) : (
                            <VVNRepresentativeQuickTable notifications={notifications} onRefresh={loadNotifications} />
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
                                    {section.component === 'SubmitVesselVisitNotificationForm' && <SubmitVesselVisitNotificationForm onSuccess={loadNotifications} />}
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
const VVNRepresentativeQuickTable = ({ notifications, onRefresh }) => {
    const { t } = useTranslation();
    const [vessels, setVessels] = React.useState([]);
    const [docks, setDocks] = React.useState([]);
    const [shippingAgentOrganizations, setShippingAgentOrganizations] = React.useState([]);


    React.useEffect(() => {
        async function fetchMeta() {
            const v = await apiService.getVessels();
            const d = await apiService.getDocks();
            const orgs = await apiService.getOrganizations();
            setShippingAgentOrganizations(orgs || []);
            setVessels(v || []);
            setDocks(d || []);
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
                                <th>{t('vesselVisitNotificationsHubPage.table.crewSize')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.loadingManifest')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.unloadingManifest')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.organization')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.arrivalTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.departureTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.loadingTime')}</th>
								<th>{t('vesselVisitNotificationsHubPage.table.unloadingTime')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((n) => (
                                <tr key={n.id}>
                                    <td className="id-cell">{n.id || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                    <td>{n.vesselIMO ? `${n.vesselIMO} (${getVesselName(n.vesselIMO)})` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                    <td>{n.dockId ? `${n.dockId} (${getDockName(n.dockId)})` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                    <td>{n.visitDate ? new Date(n.visitDate).toLocaleDateString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                    <td>
                                        <span className={`status-badge status-${(n.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {n.status || t('vesselVisitNotificationsHubPage.table.notAvailable')}
                                        </span>
                                    </td>
                                    <td>{n.purpose || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                    <td>{n.crew ? n.crew.length : 0}</td>
                                    <td>
										{n.loadingManifest && n.loadingManifest.containers && n.loadingManifest.containers.length > 0
											? n.loadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>{t('vesselVisitNotificationsHubPage.table.none')}</span>}
									</td>
									<td>
										{n.unloadingManifest && n.unloadingManifest.containers && n.unloadingManifest.containers.length > 0
											? n.unloadingManifest.containers.map(c => c.identifier).join(', ')
											: <span style={{ color: '#888' }}>{t('vesselVisitNotificationsHubPage.table.none')}</span>}
									</td>
                                    <td>{getOrganizationLegalName(n.shippingAgentOrganizationId) || t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.arrivalTime ? new Date(n.arrivalTime).toLocaleString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.desiredDepartureTime ? new Date(n.desiredDepartureTime).toLocaleString() : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.estimatedLoadingDurationMinutes != null ? `${n.estimatedLoadingDurationMinutes} min` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
									<td>{n.estimatedUnloadingDurationMinutes != null ? `${n.estimatedUnloadingDurationMinutes} min` : t('vesselVisitNotificationsHubPage.table.notAvailable')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('VVNHubPageForRepresentatives.jsx component loaded!');