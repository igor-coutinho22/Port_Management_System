// Vessels Management Hub Page - Swagger-style expandable interface
console.log('SVesselsHubPage.jsx is loading...');

const VesselsHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [vessels, setVessels] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all vessels for quick view
    const loadVessels = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getVessels();
            setVessels(data);
        } catch (error) {
            console.error('Error loading vessels:', error);
            setVessels([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load vessels when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadVessels();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: `${t('vessels.hub.page.register.title')}`,
            description: t('vessels.hub.page.register.desc'),
            color: '#27ae60',
            component: 'RegisterVesselForm'
        },
        {
            id: 'search',
            title: `${t('vessels.hub.page.search.title')}`,
            description: t('vessels.hub.page.search.desc'),
            color: '#3498db',
            component: 'SearchVesselsForm'
        },
        {
            id: 'getByImo',
            title: `${t('vessels.hub.page.get_by_imo.title')}`,
            description: t('vessels.hub.page.get_by_imo.desc'),
            color: '#2980b9',
            component: 'GetVesselByImoForm'
        },
        {
            id: 'edit',
            title: `${t('vessels.hub.page.edit.title')}`,
            description: t('vessels.hub.page.edit.desc'),
            color: '#f39c12',
            component: 'EditVesselForm'
        },
        {
            id: 'delete',
            title: `${t('vessels.hub.page.delete.title')}`,
            description: t('vessels.hub.page.delete.desc'),
            color: '#e74c3c',
            component: 'DeleteVesselForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('vessels.hub.page.main.title')}
                </h2>
                <p>{t('vessels.hub.page.main.desc')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('vessels.hub.page.quick_data_view')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('vessels.hub.page.loading_vessels')}</div>
                        ) : (
                            <VesselsQuickTable vessels={vessels} onRefresh={loadVessels} />
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
                                    {section.component === 'RegisterVesselForm' && <RegisterVesselForm onSuccess={loadVessels} />}
                                    {section.component === 'SearchVesselsForm' && <SearchVesselsForm />}
                                    {section.component === 'GetVesselByImoForm' && <GetVesselByImoForm />}
                                    {section.component === 'EditVesselForm' && <EditVesselForm onSuccess={loadVessels} />}
                                    {section.component === 'DeleteVesselForm' && <DeleteVesselForm onSuccess={loadVessels} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick table component for the floating view
const VesselsQuickTable = ({ vessels, onRefresh }) => {
    const { t } = useTranslation();
    
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('vessels.hub.page.overview')} ({vessels.length} {t('vessels.hub.page.total')})</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 {t('vessels.hub.page.refresh')}</button>
            </div>
            
            {vessels.length === 0 ? (
                <div className="no-data">
                    <h3>{t('vessels.hub.page.no_vessels_found')}</h3>
                    <p>{t('vessels.hub.page.register_first_vessel')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('vessels.columns.imo')}</th>
                                <th>{t('vessels.columns.name')}</th>
                                <th>{t('vessels.columns.operator')}</th>
                                <th>{t('vessels.columns.type')}</th>
                                <th>{t('vessels.columns.crane_count')}</th>
                                <th>{t('vessels.columns.dock_length')}</th>
                                <th>{t('vessels.columns.dimensions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vessels.map((vessel) => (
                                <tr key={vessel.imo}>
                                    <td>{vessel.imo || 'N/A'}</td>
                                    <td>{vessel.vesselName || 'N/A'}</td>
                                    <td>{vessel.operatorName || 'N/A'}</td>
                                    <td>{vessel.vesselTypeName || 'N/A'}</td>
                                    <td>{vessel.requiredCraneCount || 'N/A'}</td>
                                    <td>{vessel.requiredDockLength || 'N/A'}</td>
                                    <td>
                                        {(vessel.bays || 0)}x{(vessel.rows || 0)}x{(vessel.tiers || 0)}
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

console.log('VesselsHubPage component loaded!');