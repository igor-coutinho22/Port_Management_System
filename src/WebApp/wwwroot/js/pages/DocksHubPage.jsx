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
            title: `📝 Register Dock`,
            description: 'Create a new dock with specifications and allowed vessel types',
            color: '#27ae60',
            component: 'RegisterDockForm'
        },
        {
            id: 'search',
            title: `🔍 Search Docks`,
            description: 'Search docks by name, location, or vessel type',
            color: '#3498db',
            component: 'SearchDocksForm'
        },
        {
            id: 'getById',
            title: `🎯 Get Dock by ID`,
            description: 'Retrieve detailed information about a specific dock',
            color: '#2980b9',
            component: 'GetDockByIdForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Dock`,
            description: 'Update dock specifications and allowed vessel types',
            color: '#f39c12',
            component: 'EditDockForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Dock`,
            description: 'Remove a dock from the system',
            color: '#e74c3c',
            component: 'DeleteDockForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    🏭 Docks Management
                </h2>
                <p>Comprehensive dock management system for port operations</p>
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
                            <div className="loading">Loading docks...</div>
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
                <h4>Docks Overview ({docks.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            
            {docks.length === 0 ? (
                <div className="no-data">
                    <h3>No docks found</h3>
                    <p>Register your first dock to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Length (m)</th>
                                <th>Depth (m)</th>
                                <th>Max Draft (m)</th>
                                <th>Allowed Vessel Types</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docks.map((dock) => {
                                // Handle allowedVesselTypes collection properly
                                let vesselTypes = 'None specified';
                                if (dock.allowedVesselTypes && Array.isArray(dock.allowedVesselTypes) && dock.allowedVesselTypes.length > 0) {
                                    vesselTypes = dock.allowedVesselTypes
                                        .map(vt => vt.name || vt.vesselTypeName || vt)
                                        .join(', ');
                                } else if (dock.allowedVesselTypes && typeof dock.allowedVesselTypes === 'object') {
                                    // In case it's an object with vessel type details
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