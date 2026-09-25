// Resources Management Hub Page - Swagger-style expandable interface

const ResourcesHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [resources, setResources] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all resources for quick view
    const loadResources = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getResources();
            setResources(data || []);
        } catch (error) {
            console.error('Error loading resources:', error);
            setResources([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load resources when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadResources();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: t('resourcesHubPage.section.register.title'),
            description: t('resourcesHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterResourceForm'
        },
        {
            id: 'search',
            title: t('resourcesHubPage.section.search.title'),
            description: t('resourcesHubPage.section.search.description'),
            color: '#3498db',
            component: 'SearchResourceForm'
        },
        {
            id: 'edit',
            title: t('resourcesHubPage.section.edit.title'),
            description: t('resourcesHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditResourceForm'
        },
        {
            id: 'status',
            title: t('resourcesHubPage.section.status.title'),
            description: t('resourcesHubPage.section.status.description'),
            color: '#9b59b6',
            component: 'ResourceStatusForm'
        },
        {
            id: 'delete',
            title: t('resourcesHubPage.section.delete.title'),
            description: t('resourcesHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteResourceForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('resourcesHubPage.title')}
                </h2>
                <p>{t('resourcesHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('resourcesHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? t('resourcesHubPage.quickView.arrow.up') : t('resourcesHubPage.quickView.arrow.down')}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('resourcesHubPage.quickView.loading')}</div>
                        ) : (
                            <ResourcesQuickTable resources={resources} onRefresh={loadResources} />
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
                                    {section.component === 'RegisterResourceForm' && <RegisterResourceForm onSuccess={loadResources} />}
                                    {section.component === 'SearchResourceForm' && <SearchResourceForm />}
                                    {section.component === 'EditResourceForm' && <EditResourceForm onSuccess={loadResources} />}
                                    {section.component === 'ResourceStatusForm' && <ResourceStatusForm onSuccess={loadResources} />}
                                    {section.component === 'DeleteResourceForm' && <DeleteResourceForm onSuccess={loadResources} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Resources Quick Table Component
const ResourcesQuickTable = ({ resources, onRefresh }) => {
    const { t } = useTranslation();

    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualifications properly
            let qualifications = t('resourcesHubPage.details.none');
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q)
                    .join(', ');
            }
            
            alert(`${t('resourcesHubPage.details.title')}:\n\n${t('resourcesHubPage.details.id')}: ${resource.id || 'N/A'}\n${t('resourcesHubPage.details.description')}: ${resource.description || 'N/A'}\n${t('resourcesHubPage.details.type')}: ${(resource.resourceType) || 'N/A'}\n${t('resourcesHubPage.details.status')}: ${resource.status || 'N/A'}\n${t('resourcesHubPage.details.capacity')}: ${resource.operationalCapacity || 'N/A'}\n${t('resourcesHubPage.details.setupTime')}: ${resource.setupTime || 'N/A'} ${t('resourcesHubPage.details.minutes')}\n${t('resourcesHubPage.details.qualifications')}: ${qualifications}`);
        } catch (error) {
            alert(t('resourcesHubPage.details.error') + error.message);
        }
    };

    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('resourcesHubPage.quickView.overview')} ({resources.length} {t('resourcesHubPage.quickView.total')})</h4>
                <button onClick={onRefresh} className="refresh-btn">
                    {t('resourcesHubPage.quickView.refresh')}
                </button>
            </div>

            {resources.length === 0 ? (
                <div className="empty-resources">
                    <h4>{t('resourcesHubPage.quickView.noData.title')}</h4>
                    <p>{t('resourcesHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <table className="quick-table">
                    <thead>
                        <tr>
                            <th>{t('resourcesHubPage.table.id')}</th>
                            <th>{t('resourcesHubPage.table.description')}</th>
                            <th>{t('resourcesHubPage.table.type')}</th>
                            <th>{t('resourcesHubPage.table.status')}</th>
                            <th>{t('resourcesHubPage.table.capacity')}</th>
                            <th>{t('resourcesHubPage.table.setupTime')}</th>
                            <th>{t('resourcesHubPage.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map((resource) => (
                            <tr key={resource.id}>
                                <td>{resource.id}</td>
                                <td>{resource.description || 'N/A'}</td>
                                <td>{resource.resourceType}</td>
                                <td>
                                    <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                        {resource.status || 'N/A'}
                                    </span>
                                </td>
                                <td>{resource.operationalCapacity}</td>
                                <td>{resource.setupTime} min</td>
                                <td>
                                    <button 
                                        onClick={() => handleViewDetails(resource.id)}
                                        className="action-btn view-btn"
                                        title={t('resourcesHubPage.table.viewDetails')}
                                    >
                                        👁️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
