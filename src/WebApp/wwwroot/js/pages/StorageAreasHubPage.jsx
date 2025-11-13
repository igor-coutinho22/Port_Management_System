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
            id: 'getById',
            title: `🎯 Get Storage Area by ID`,
            description: 'Retrieve detailed information about a specific storage area by its ID',
            color: '#2980b9',
            component: 'GetStorageAreaByIdForm'
        },
        {
            id: 'getByName',
            title: `🔎 Get Storage Area by Name`,
            description: 'Retrieve detailed information about a specific storage area by its name',
            color: '#3498db',
            component: 'GetStorageAreaByNameForm'
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
                                    {section.component === 'RegisterContainerYardForm' && <RegisterYardForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'RegisterWarehouseForm' && <RegisterWarehouseForm onSuccess={loadStorageAreas} />}
                                    {section.component === 'GetStorageAreaByIdForm' && <GetStorageAreaByIdForm />}
                                    {section.component === 'GetStorageAreaByNameForm' && <GetStorageAreaByNameForm />}
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
                                <th>Dock Connections</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map((area) => {
                                // Support nested DTOs (ContainerYardDto, WarehouseDto)
                                const sa = area.storageArea || area;
                                const id = sa.id || area.id || 'N/A';
                                const name = sa.name || area.name || 'N/A';
                                const type = sa.type || area.type || 'N/A';
                                const maxCapacityTeu = sa.maxCapacityTeu || area.maxCapacityTeu || 'N/A';
                                const currentOccupancyTeu = sa.currentOccupancyTeu || area.currentOccupancyTeu || 'N/A';
                                const utilizationPercent = maxCapacityTeu && currentOccupancyTeu ? Math.round((currentOccupancyTeu / maxCapacityTeu) * 100) : 0;
                                let specializedInfo = 'N/A';
                                // Warehouse specialized info
                                if (type === 'Warehouse' || type === 'warehouse') {
                                    specializedInfo = area.specializedCargoType || 'General';
                                } else if (type === 'ContainerYard' || type === 'containerYard') {
                                    // Try dockIds from top-level or nested
                                    const dockIds = area.dockIds || sa.dockIds || (sa.dockConnections ? sa.dockConnections.map(dc => dc.dockId) : []);
                                    const dockCount = dockIds ? dockIds.length : 0;
                                    specializedInfo = `${dockCount} docks served`;
                                }
                                // Dock connections column
                                const dockConnections = sa.dockConnections && sa.dockConnections.length > 0
                                    ? `${sa.dockConnections.length} dock connections`
                                    : 'None';
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

console.log('StorageAreasHubPage component loaded! 🏭');