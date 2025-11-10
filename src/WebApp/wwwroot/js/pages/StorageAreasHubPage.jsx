// Storage Areas Management Hub Page - Swagger-style expandable interface
console.log('🏭 StorageAreasHubPage.jsx is loading...');

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
            title: `📦 Register Container Yard`,
            description: 'Create a new container yard for temporary container storage',
            color: '#27ae60',
            component: 'RegisterContainerYardForm'
        },
        {
            id: 'registerWarehouse',
            title: `🏭 Register Warehouse`,
            description: 'Create a new warehouse for specialized cargo handling',
            color: '#2ecc71',
            component: 'RegisterWarehouseForm'
        },
        {
            id: 'search',
            title: `🔍 Search Storage Areas`,
            description: 'Search storage areas by name or type',
            color: '#3498db',
            component: 'SearchStorageAreasForm'
        },
        {
            id: 'getById',
            title: `🎯 Get Storage Area by ID`,
            description: 'Retrieve detailed information about a specific storage area',
            color: '#2980b9',
            component: 'GetStorageAreaByIdForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Storage Area`,
            description: 'Update storage area capacity and specifications',
            color: '#f39c12',
            component: 'EditStorageAreaForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Storage Area`,
            description: 'Remove a storage area from the system',
            color: '#e74c3c',
            component: 'DeleteStorageAreaForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    🏭 Storage Areas Management
                </h2>
                <p>Manage container yards, warehouses, and specialized storage facilities</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    Quick Data View
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">Loading storage areas...</div>
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
                                    {section.component === 'RegisterContainerYardForm' && <RegisterContainerYardForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'RegisterWarehouseForm' && <RegisterWarehouseForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'SearchStorageAreasForm' && <SearchStorageAreasForm />}
                                    {section.component === 'GetStorageAreaByIdForm' && <GetStorageAreaByIdForm />}
                                    {section.component === 'EditStorageAreaForm' && <EditStorageAreaForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'DeleteStorageAreaForm' && <DeleteStorageAreaForm onSuccess={loadStorageAreas} />}
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
                <h4>Storage Areas Overview ({storageAreas.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            
            {storageAreas.length === 0 ? (
                <div className="no-data">
                    <h3>No storage areas found</h3>
                    <p>Register your first storage area to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Max Capacity (TEU)</th>
                                <th>Current Occupancy (TEU)</th>
                                <th>Utilization</th>
                                <th>Specialized Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map((area) => {
                                const utilizationPercent = area.maxCapacityTeu ? Math.round((area.currentOccupancyTeu / area.maxCapacityTeu) * 100) : 0;
                                let specializedInfo = 'N/A';
                                
                                if (area.type === 'Warehouse' || area.type === 'warehouse') {
                                    specializedInfo = area.specializedCargoType || 'General';
                                } else if (area.type === 'ContainerYard' || area.type === 'containerYard') {
                                    const dockCount = area.dockIds ? area.dockIds.length : 0;
                                    specializedInfo = `${dockCount} docks served`;
                                }
                                
                                return (
                                    <tr key={area.id}>
                                        <td>{area.id || 'N/A'}</td>
                                        <td className="name-cell">{area.name || 'N/A'}</td>
                                        <td>{area.type || 'N/A'}</td>
                                        <td>{area.maxCapacityTeu || 'N/A'}</td>
                                        <td>{area.currentOccupancyTeu || 'N/A'}</td>
                                        <td>
                                            <span className={`utilization-badge ${utilizationPercent >= 90 ? 'high' : utilizationPercent >= 70 ? 'medium' : 'low'}`}>
                                                {utilizationPercent}%
                                            </span>
                                        </td>
                                        <td>{specializedInfo}</td>
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

console.log('StorageAreasHubPage component loaded! 🏭');