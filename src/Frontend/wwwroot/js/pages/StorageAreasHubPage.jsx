// Storage Areas Management Hub Page - Swagger-style expandable interface

const StorageAreasHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all storage areas for quick view
    const loadStorageAreas = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getStorageAreas();
            setStorageAreas(data);
        } catch (error) {
            console.error('Error loading storage areas:', error);
            setStorageAreas([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load storage areas when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadStorageAreas();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'registerContainerYard',
            title: t('storageAreasHubPage.section.registerContainerYard.title'),
            description: t('storageAreasHubPage.section.registerContainerYard.description'),
            color: '#27ae60',
            component: 'RegisterContainerYardForm'
        },
        {
            id: 'registerWarehouse',
            title: t('storageAreasHubPage.section.registerWarehouse.title'),
            description: t('storageAreasHubPage.section.registerWarehouse.description'),
            color: '#2ecc71',
            component: 'RegisterWarehouseForm'
        },
        {
            id: 'getById',
            title: t('storageAreasHubPage.section.getById.title'),
            description: t('storageAreasHubPage.section.getById.description'),
            color: '#2980b9',
            component: 'GetStorageAreaByIdForm'
        },
        {
            id: 'getByName',
            title: t('storageAreasHubPage.section.getByName.title'),
            description: t('storageAreasHubPage.section.getByName.description'),
            color: '#3498db',
            component: 'GetStorageAreaByNameForm'
        },
        {
            id: 'edit',
            title: t('storageAreasHubPage.section.edit.title'),
            description: t('storageAreasHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditStorageAreaForm'
        },
        {
            id: 'delete',
            title: t('storageAreasHubPage.section.delete.title'),
            description: t('storageAreasHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteStorageAreaForm'
        }
        ,
        {
            id: 'addConnection',
            title: t('storageAreasHubPage.section.addConnection.title'),
            description: t('storageAreasHubPage.section.addConnection.description'),
            color: '#16a085',
            component: 'AddConnectionForm'
        },
        {
            id: 'updateConnection',
            title: t('storageAreasHubPage.section.updateConnection.title'),
            description: t('storageAreasHubPage.section.updateConnection.description'),
            color: '#f1c40f',
            component: 'UpdateDockConnectionForm'
        },
        {
            id: 'deleteConnection',
            title: t('storageAreasHubPage.section.deleteConnection.title'),
            description: t('storageAreasHubPage.section.deleteConnection.description'),
            color: '#c0392b',
            component: 'DeleteDockConnectionForm'
        },
        {
            id: 'getConnection',
            title: t('storageAreasHubPage.section.getConnection.title'),
            description: t('storageAreasHubPage.section.getConnection.description'),
            color: '#2980b9',
            component: 'GetDockConnectionForm'
        },
        {
            id: 'getConnections',
            title: t('storageAreasHubPage.section.getConnections.title'),
            description: t('storageAreasHubPage.section.getConnections.description'),
            color: '#8e44ad',
            component: 'ListDockConnectionsForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('storageAreasHubPage.title')}
                </h2>
                <p>{t('storageAreasHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('storageAreasHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('storageAreasHubPage.quickView.loading')}</div>
                        ) : (
                            <StorageAreasQuickTable storageAreas={storageAreas} onRefresh={loadStorageAreas} />
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
                                    {section.component === 'RegisterContainerYardForm' && <RegisterYardForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'RegisterWarehouseForm' && <RegisterWarehouseForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'GetStorageAreaByIdForm' && <GetStorageAreaByIdForm />}
                                    {section.component === 'GetStorageAreaByNameForm' && <GetStorageAreaByNameForm />}
                                    {section.component === 'EditStorageAreaForm' && <EditStorageAreaForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'DeleteStorageAreaForm' && <DeleteStorageAreaForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'AddConnectionForm' && <AddConnectionForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'UpdateDockConnectionForm' && <UpdateDockConnectionForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'DeleteDockConnectionForm' && <DeleteDockConnectionForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'GetDockConnectionForm' && <GetDockConnectionForm />}
                                    {section.component === 'ListDockConnectionsForm' && <ListDockConnectionsForm />}
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
const StorageAreasQuickTable = ({ storageAreas, onRefresh }) => {
    const { t } = useTranslation();
    
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('storageAreasHubPage.quickView.overview')} ({storageAreas.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('storageAreasHubPage.quickView.refresh')}</button>
            </div>
            {storageAreas.length === 0 ? (
                <div className="no-data">
                    <h3>{t('storageAreasHubPage.quickView.noData.title')}</h3>
                    <p>{t('storageAreasHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('storageAreasHubPage.table.id')}</th>
                                <th>{t('storageAreasHubPage.table.name')}</th>
                                <th>{t('storageAreasHubPage.table.type')}</th>
                                <th>{t('storageAreasHubPage.table.maxCapacity')}</th>
                                <th>{t('storageAreasHubPage.table.currentOccupancy')}</th>
                                <th>{t('storageAreasHubPage.table.utilization')}</th>
                                <th>{t('storageAreasHubPage.table.specializedInfo')}</th>
                                <th>{t('storageAreasHubPage.table.dockConnections')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map((area) => {
                                // Support nested DTOs (ContainerYardDto, WarehouseDto)
                                const sa = area.storageArea || area;
                                const id = sa.id || area.id || t('storageAreasHubPage.table.notAvailable');
                                const name = sa.name || area.name || t('storageAreasHubPage.table.notAvailable');
                                const type = sa.type || area.type || t('storageAreasHubPage.table.notAvailable');
                                const maxCapacityTeu = sa.maxCapacityTeu || area.maxCapacityTeu || t('storageAreasHubPage.table.notAvailable');
                                const currentOccupancyTeu = sa.currentOccupancyTeu || area.currentOccupancyTeu || t('storageAreasHubPage.table.notAvailable');
                                const utilizationPercent = maxCapacityTeu && currentOccupancyTeu ? Math.round((currentOccupancyTeu / maxCapacityTeu) * 100) : 0;
                                let specializedInfo = t('storageAreasHubPage.table.notAvailable');
                                // Warehouse specialized info
                                if (type === 'Warehouse' || type === 'warehouse') {
                                    specializedInfo = area.specializedCargoType || t('storageAreasHubPage.table.general');
                                } else if (type === 'ContainerYard' || type === 'containerYard') {
                                    // Try dockIds from top-level or nested
                                    const dockIds = area.dockIds || sa.dockIds || (sa.dockConnections ? sa.dockConnections.map(dc => dc.dockId) : []);
                                    const dockCount = dockIds ? dockIds.length : 0;
                                    specializedInfo = t('storageAreasHubPage.table.docksServed', { count: dockCount });
                                }
                                // Dock connections column
                                const dockConnections = sa.dockConnections && sa.dockConnections.length > 0
                                    ? t('storageAreasHubPage.table.dockConnectionsCount', { count: sa.dockConnections.length })
                                    : t('storageAreasHubPage.table.none');
                                return (
                                    <tr key={id}>
                                        <td>{id}</td>
                                        <td className="name-cell">{name}</td>
                                        <td>{type}</td>
                                        <td>{maxCapacityTeu}</td>
                                        <td>{currentOccupancyTeu}</td>
                                        <td>
                                            <span className={`utilization-badge ${utilizationPercent >= 90 ? 'high' : utilizationPercent >= 70 ? 'medium' : 'low'}`}>
                                                {utilizationPercent}%
                                            </span>
                                        </td>
                                        <td>{specializedInfo}</td>
                                        <td>{dockConnections}</td>
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
