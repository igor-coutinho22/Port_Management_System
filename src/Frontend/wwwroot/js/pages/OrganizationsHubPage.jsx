// Organizations Management Hub Page - Swagger-style expandable interface

const OrganizationsHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [organizations, setOrganizations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all organizations for quick view
    const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getOrganizations();
            setOrganizations(data);
        } catch (error) {
            console.error('Error loading organizations:', error);
            setOrganizations([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (showQuickView) {
            loadOrganizations();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: t('organizationsHubPage.section.register.title'),
            description: t('organizationsHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterOrganizationForm'
        },
        {
            id: 'getById',
            title: t('organizationsHubPage.section.getById.title'),
            description: t('organizationsHubPage.section.getById.description'),
            color: '#2980b9',
            component: 'GetOrganizationByIdForm'
        },
        {
            id: 'edit',
            title: t('organizationsHubPage.section.edit.title'),
            description: t('organizationsHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditOrganizationForm'
        },
        {
            id: 'delete',
            title: t('organizationsHubPage.section.delete.title'),
            description: t('organizationsHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteOrganizationForm'
        },
        {
            id: 'add',
            title: t('organizationsHubPage.section.add.title'),
            description: t('organizationsHubPage.section.add.description'),
            color: '#8e44ad',
            component: 'AddRepresentativeToOrganizationForm'
        },
        {
            id: 'remove',
            title: t('organizationsHubPage.section.remove.title'),
            description: t('organizationsHubPage.section.remove.description'),
            color: '#8e44ad',
            component: 'RemoveRepresentativeFromOrganizationForm'
        },
        {
            id: 'manageStatus',
            title: t('organizationsHubPage.section.manageStatus.title'),
            description: t('organizationsHubPage.section.manageStatus.description'),
            color: '#16a085',
            component: 'ActivateDeactivateOrganizationForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">{t('organizationsHubPage.title')}</h2>
                <p>{t('organizationsHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('organizationsHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? t('organizationsHubPage.quickView.arrow.up') : t('organizationsHubPage.quickView.arrow.down')}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('organizationsHubPage.quickView.loading')}</div>
                        ) : (
                            <OrganizationsQuickTable organizations={organizations} onRefresh={loadOrganizations} />
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
                                    {t(`sectionBadge.${section.id}`, section.id).toUpperCase()}
                                </span>
                                <span className={`expand-arrow ${expandedSection === section.id ? 'up' : 'down'}`}>
                                    {expandedSection === section.id ? '▲' : '▼'}
                                </span>
                            </div>
                        </div>

                        {expandedSection === section.id && (
                            <div className="operation-content">
                                <div className="operation-body">
                                    {section.component === 'RegisterOrganizationForm' && <RegisterOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'GetOrganizationByIdForm' && <GetOrganizationByIdForm />}
                                    {section.component === 'EditOrganizationForm' && <EditOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'DeleteOrganizationForm' && <DeleteOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'AddRepresentativeToOrganizationForm' && <AddRepresentativeToOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'RemoveRepresentativeFromOrganizationForm' && <RemoveRepresentativeFromOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'ActivateDeactivateOrganizationForm' && <ActivateDeactivateOrganizationForm onSuccess={loadOrganizations} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Organizations Data
const OrganizationsQuickTable = ({ organizations, onRefresh }) => {
    const { t } = useTranslation();
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('organizationsHubPage.title')} ({organizations.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('organizationsHubPage.quickView.refresh')}</button>
            </div>
            {organizations.length === 0 ? (
                <div className="no-data">
                    <h3>{t('organizationsHubPage.quickView.noData.title')}</h3>
                    <p>{t('organizationsHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('organizationsHubPage.table.id')}</th>
                                <th>{t('organizationsHubPage.table.identifier')}</th>
                                <th>{t('organizationsHubPage.table.legalName')}</th>
                                <th>{t('organizationsHubPage.table.alternativeNames')}</th>
                                <th>{t('organizationsHubPage.table.address')}</th>
                                <th>{t('organizationsHubPage.table.taxNumber')}</th>
                                <th>{t('organizationsHubPage.table.representatives')}</th>
                                <th>{t('organizationsHubPage.table.notifications')}</th>
                                <th>{t('organizationsHubPage.table.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org) => (
                                <tr key={org.id || org.legalName}>
                                    <td className="id-cell">{org.id || 'N/A'}</td>
                                    <td className="identifier-cell">{org.identifier || 'N/A'}</td>
                                    <td className="name-cell">{org.legalName || 'N/A'}</td>
                                    <td>{org.alternativeNames || 'N/A'}</td>
                                    <td>{org.address || 'N/A'}</td>
                                    <td>{org.taxNumber || 'N/A'}</td>
                                    <td>
                                        {Array.isArray(org.representatives) && org.representatives.length > 0
                                            ? org.representatives.map((rep, idx) => (
                                                <span key={rep.id || idx} style={{ display: 'block', color: '#2de1fc', fontWeight: 500 }}>
                                                    {rep.name || rep.legalName || 'N/A'}{rep.email ? ` (${rep.email})` : ''}
                                                </span>
                                            ))
                                            : <span style={{ color: '#b8eaff' }}>{t('organizationsHubPage.table.none')}</span>
                                        }
                                    </td>
                                    <td>
                                        {org.vesselVisitNotifications ? org.vesselVisitNotifications.length : 0}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${org.isActive === true ? 'true' : 'false'}`}>
                                            {org.isActive === true ? t('organizationsHubPage.table.active') : org.isActive === false ? t('organizationsHubPage.table.inactive') : 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
