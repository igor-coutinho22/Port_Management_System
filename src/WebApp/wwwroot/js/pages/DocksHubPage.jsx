// Docks Management Hub Page - Swagger-style expandable interface
console.log('DocksHubPage.jsx is loading...');

const DocksHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [docks, setDocks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all docks for quick view
    const loadDocks = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getDocks();
            setDocks(data);
        } catch (error) {
            console.error('Error loading docks:', error);
            setDocks([]);
        } finally {
            setIsLoading(false);
        }
    };

    

    // Load docks when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadDocks();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: t('docksHubPage.section.register.title'),
            description: t('docksHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterDockForm'
        },
        {
            id: 'search',
            title: t('docksHubPage.section.search.title'),
            description: t('docksHubPage.section.search.description'),
            color: '#3498db',
            component: 'SearchDocksForm'
        },
        {
            id: 'getById',
            title: t('docksHubPage.section.getById.title'),
            description: t('docksHubPage.section.getById.description'),
            color: '#2980b9',
            component: 'GetDockByIdForm'
        },
        {
            id: 'edit',
            title: t('docksHubPage.section.edit.title'),
            description: t('docksHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditDockForm'
        },
        {
            id: 'delete',
            title: t('docksHubPage.section.delete.title'),
            description: t('docksHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteDockForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">{t('docksHubPage.title')}</h2>
                <p>{t('docksHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('docksHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? t('docksHubPage.quickView.arrow.up') : t('docksHubPage.quickView.arrow.down')}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('docksHubPage.quickView.loading')}</div>
                        ) : (
                            <DocksQuickTable docks={docks} onRefresh={loadDocks} />
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
                                    {section.component === 'RegisterDockForm' && <RegisterDockForm onSuccess={loadDocks} />}
                                    {section.component === 'SearchDocksForm' && <SearchDocksForm />}
                                    {section.component === 'GetDockByIdForm' && <GetDockByIdForm />}
                                    {section.component === 'EditDockForm' && <EditDockForm onSuccess={loadDocks} />}
                                    {section.component === 'DeleteDockForm' && <DeleteDockForm onSuccess={loadDocks} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Docks Data
const DocksQuickTable = ({ docks, onRefresh }) => {
    const { t } = useTranslation();
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('docksHubPage.title')} ({docks.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('docksHubPage.quickView.refresh')}</button>
            </div>
            {docks.length === 0 ? (
                <div className="no-data">
                    <h3>{t('docksHubPage.quickView.noData.title')}</h3>
                    <p>{t('docksHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('docksHubPage.table.id')}</th>
                                <th>{t('docksHubPage.table.name')}</th>
                                <th>{t('docksHubPage.table.location')}</th>
                                <th>{t('docksHubPage.table.length')}</th>
                                <th>{t('docksHubPage.table.depth')}</th>
                                <th>{t('docksHubPage.table.maxDraft')}</th>
                                <th>{t('docksHubPage.table.allowedVesselTypes')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docks.map((dock) => {
                                let vesselTypes = t('docksHubPage.table.noneSpecified');
                                if (dock.allowedVesselTypes && Array.isArray(dock.allowedVesselTypes) && dock.allowedVesselTypes.length > 0) {
                                    vesselTypes = dock.allowedVesselTypes
                                        .map(vt => vt.name || vt.vesselTypeName || vt)
                                        .join(', ');
                                } else if (dock.allowedVesselTypes && typeof dock.allowedVesselTypes === 'object') {
                                    vesselTypes = Object.values(dock.allowedVesselTypes)
                                        .map(vt => vt.name || vt.vesselTypeName || vt)
                                        .join(', ');
                                }
                                return (
                                    <tr key={dock.id || dock.name}>
                                        <td className="id-cell">{dock.id || 'N/A'}</td>
                                        <td className="name-cell">{dock.name || 'N/A'}</td>
                                        <td className="location-cell">{dock.location || 'N/A'}</td>
                                        <td>{dock.lengthMeters || 'N/A'}</td>
                                        <td>{dock.depthMeters || 'N/A'}</td>
                                        <td>{dock.maxDraftMeters || 'N/A'}</td>
                                        <td>{vesselTypes}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('DocksHubPage component loaded! ⚓');