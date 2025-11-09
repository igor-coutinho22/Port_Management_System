// Vessel Types Management Hub Page - Swagger-style expandable interface
console.log('🚢 VesselTypesHubPage.jsx is loading...');

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
            title: `📝 Register Vessel Type`,
            description: 'Create a new vessel type with specifications and capacity limits',
            color: '#27ae60',
            component: 'RegisterVesselTypeForm'
        },
        {
            id: 'search',
            title: `🔍 Search Vessel Types`,
            description: 'Search vessel types by name or description',
            color: '#3498db',
            component: 'SearchVesselTypesForm'
        },
        {
            id: 'getByName',
            title: `🎯 Get Vessel Type by Name`,
            description: 'Retrieve detailed information about a specific vessel type',
            color: '#2980b9',
            component: 'GetVesselTypeByNameForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Vessel Type`,
            description: 'Update vessel type specifications and capacity information',
            color: '#f39c12',
            component: 'EditVesselTypeForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Vessel Type`,
            description: 'Remove a vessel type from the system',
            color: '#e74c3c',
            component: 'DeleteVesselTypeForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    🛳️ Vessel Types Management
                </h2>
                <p>Manage vessel type specifications, capacity limits, and container configurations</p>
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
                            <div className="loading">Loading vessel types...</div>
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
                <h4>Vessel Types Overview ({vesselTypes.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            
            {vesselTypes.length === 0 ? (
                <div className="no-data">
                    <h3>No vessel types found</h3>
                    <p>Register your first vessel type to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Max Bays</th>
                                <th>Max Rows</th>
                                <th>Max Tiers</th>
                                <th>Max TEU Capacity</th>
                                <th>Dimensions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vesselTypes.map((vesselType) => (
                                <tr key={vesselType.name}>
                                    <td className="name-cell">{vesselType.name || 'N/A'}</td>
                                    <td className="description-cell">{vesselType.description || 'N/A'}</td>
                                    <td>{vesselType.maxBays || 'N/A'}</td>
                                    <td>{vesselType.maxRows || 'N/A'}</td>
                                    <td>{vesselType.maxTiers || 'N/A'}</td>
                                    <td>{vesselType.maxTEUCapacity || 'N/A'}</td>
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

console.log('VesselTypesHubPage component loaded! 🚢');