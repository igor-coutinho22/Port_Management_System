// Vessel Types Management Hub Page - Swagger-style expandable interface

const VesselTypesHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all vessel types for quick view
    const loadVesselTypes = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getVesselTypes();
            setVesselTypes(data);
        } catch (error) {
            console.error('Error loading vessel types:', error);
            setVesselTypes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load vessel types when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadVesselTypes();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: t('vesselTypesHubPage.section.register.title'),
            description: t('vesselTypesHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterVesselTypeForm'
        },
        {
            id: 'search',
            title: t('vesselTypesHubPage.section.search.title'),
            description: t('vesselTypesHubPage.section.search.description'),
            color: '#3498db',
            component: 'SearchVesselTypesForm'
        },
        {
            id: 'getByName',
            title: t('vesselTypesHubPage.section.getByName.title'),
            description: t('vesselTypesHubPage.section.getByName.description'),
            color: '#2980b9',
            component: 'GetVesselTypeByNameForm'
        },
        {
            id: 'edit',
            title: t('vesselTypesHubPage.section.edit.title'),
            description: t('vesselTypesHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditVesselTypeForm'
        },
        {
            id: 'delete',
            title: t('vesselTypesHubPage.section.delete.title'),
            description: t('vesselTypesHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteVesselTypeForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('vesselTypesHubPage.title')}
                </h2>
                <p>{t('vesselTypesHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('vesselTypesHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('vesselTypesHubPage.quickView.loading')}</div>
                        ) : (
                            <VesselTypesQuickTable vesselTypes={vesselTypes} onRefresh={loadVesselTypes} />
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
                                    {section.component === 'RegisterVesselTypeForm' && <RegisterVesselTypeForm onSuccess={loadVesselTypes} />}
                                    {section.component === 'SearchVesselTypesForm' && <SearchVesselTypesForm />}
                                    {section.component === 'GetVesselTypeByNameForm' && <GetVesselTypeByNameForm />}
                                    {section.component === 'EditVesselTypeForm' && <EditVesselTypeForm onSuccess={loadVesselTypes} />}
                                    {section.component === 'DeleteVesselTypeForm' && <DeleteVesselTypeForm onSuccess={loadVesselTypes} />}
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
const VesselTypesQuickTable = ({ vesselTypes, onRefresh }) => {
    const { t } = useTranslation();
    
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('vesselTypesHubPage.quickView.overview')} ({vesselTypes.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('vesselTypesHubPage.quickView.refresh')}</button>
            </div>
            
            {vesselTypes.length === 0 ? (
                <div className="no-data">
                    <h3>{t('vesselTypesHubPage.quickView.noData.title')}</h3>
                    <p>{t('vesselTypesHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('vesselTypesHubPage.table.name')}</th>
                                <th>{t('vesselTypesHubPage.table.description')}</th>
                                <th>{t('vesselTypesHubPage.table.maxBays')}</th>
                                <th>{t('vesselTypesHubPage.table.maxRows')}</th>
                                <th>{t('vesselTypesHubPage.table.maxTiers')}</th>
                                <th>{t('vesselTypesHubPage.table.maxTEUCapacity')}</th>
                                <th>{t('vesselTypesHubPage.table.dimensions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vesselTypes.map((vesselType) => (
                                <tr key={vesselType.name}>
                                    <td className="name-cell">{vesselType.name || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td className="description-cell">{vesselType.description || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td>{vesselType.maxBays || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td>{vesselType.maxRows || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td>{vesselType.maxTiers || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td>{vesselType.maxTEUCapacity || t('vesselTypesHubPage.table.notAvailable')}</td>
                                    <td>
                                        {(vesselType.maxBays || 0)}x{(vesselType.maxRows || 0)}x{(vesselType.maxTiers || 0)}
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
