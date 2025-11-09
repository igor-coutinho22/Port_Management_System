// Resources Management Hub Page - Swagger-style expandable interface
console.log('🏗️ ResourcesHubPage.jsx is loading...');

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
            title: '📝 Register New Resource',
            description: 'Add a new resource to the system',
            color: '#27ae60',
            component: 'RegisterResourceForm'
        },
        {
            id: 'search',
            title: '🔍 Search Resources',
            description: 'Find resources by multiple criteria',
            color: '#3498db',
            component: 'SearchResourceForm'
        },
        {
            id: 'edit',
            title: '✏️ Edit Resource',
            description: 'Update resource information',
            color: '#f39c12',
            component: 'EditResourceForm'
        },
        {
            id: 'status',
            title: '🔧 Manage Status',
            description: 'Change resource availability status',
            color: '#9b59b6',
            component: 'ResourceStatusForm'
        },
        {
            id: 'delete',
            title: '🗑️ Delete Resource',
            description: 'Remove resource from system',
            color: '#e74c3c',
            component: 'DeleteResourceForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    🏗️ Resources Management Hub
                </h2>
                <p>Complete resource management with all CRUD operations</p>
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
                            <div className="loading">Loading resources...</div>
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
    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualifications properly
            let qualifications = 'None';
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q)
                    .join(', ');
            }
            
            alert(`Resource Details:\n\nID: ${resource.id || 'N/A'}\nDescription: ${resource.description || 'N/A'}\nType: ${(resource.resourceType) || 'N/A'}\nStatus: ${resource.status || 'N/A'}\nCapacity: ${resource.operationalCapacity || 'N/A'}\nSetup Time: ${resource.setupTime || 'N/A'} minutes\nQualifications: ${qualifications}`);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Resources Overview ({resources.length} total)</h4>
                <button onClick={onRefresh} className="refresh-btn">
                    🔄 Refresh
                </button>
            </div>

            {resources.length === 0 ? (
                <div className="empty-resources">
                    <h4>No Resources Found</h4>
                    <p>Currently there are no resources registered in the system.</p>
                </div>
            ) : (
                <table className="quick-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Capacity</th>
                            <th>Setup Time</th>
                            <th>Actions</th>
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
                                        title="View Details"
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

console.log('ResourcesHubPage component loaded! 🏗️');