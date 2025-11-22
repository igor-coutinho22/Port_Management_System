// Organizations Management Hub Page - Swagger-style expandable interface
console.log('OrganizationsHubPage.jsx is loading...');

const OrganizationsHubPage = () => {
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [organizations, setOrganizations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all organizations for quick view
    const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getOrganizations();
            setOrganizations(data);
        } catch (error) {
            console.error('Error loading organizations:', error);
            setOrganizations([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (showQuickView) {
            loadOrganizations();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: `📝 Register Organization`,
            description: 'Create a new organization with legal and tax details',
            color: '#27ae60',
            component: 'RegisterOrganizationForm'
        },
        {
            id: 'getById',
            title: `🎯 Get Organization by ID`,
            description: 'Retrieve detailed information about a specific organization',
            color: '#2980b9',
            component: 'GetOrganizationByIdForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Organization`,
            description: 'Update organization legal, address, and tax details',
            color: '#f39c12',
            component: 'EditOrganizationForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Organization`,
            description: 'Remove an organization from the system',
            color: '#e74c3c',
            component: 'DeleteOrganizationForm'
        },
        {
            id: 'add',
            title: `Add Representatives`,
            description: 'Add organization representatives',
            color: '#8e44ad',
            component: 'AddRepresentativeToOrganizationForm'
        },
        {
            id: 'remove',
            title: `Remove Representatives`,
            description: 'Remove organization representatives',
            color: '#8e44ad',
            component: 'RemoveRepresentativeFromOrganizationForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    🏢 Organizations Management
                </h2>
                <p>Comprehensive organization management system for port operations</p>
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
                            <div className="loading">Loading organizations...</div>
                        ) : (
                            <OrganizationsQuickTable organizations={organizations} onRefresh={loadOrganizations} />
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
                                    {section.component === 'RegisterOrganizationForm' && <RegisterOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'GetOrganizationByIdForm' && <GetOrganizationByIdForm />}
                                    {section.component === 'EditOrganizationForm' && <EditOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'DeleteOrganizationForm' && <DeleteOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'AddRepresentativeToOrganizationForm' && <AddRepresentativeToOrganizationForm onSuccess={loadOrganizations} />}
                                    {section.component === 'RemoveRepresentativeFromOrganizationForm' && <RemoveRepresentativeFromOrganizationForm onSuccess={loadOrganizations} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Organizations Data
const OrganizationsQuickTable = ({ organizations, onRefresh }) => {
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Organizations Overview ({organizations.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            {organizations.length === 0 ? (
                <div className="no-data">
                    <h3>No organizations found</h3>
                    <p>Register your first organization to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Identifier</th>
                                <th>Legal Name</th>
                                <th>Alternative Names</th>
                                <th>Address</th>
                                <th>Tax Number</th>
                                <th>Representatives</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((org) => (
                                <tr key={org.id || org.legalName}>
                                    <td className="id-cell">{org.id || 'N/A'}</td>
                                    <td className="identifier-cell">{org.identifier || 'N/A'}</td>
                                    <td className="name-cell">{org.legalName || 'N/A'}</td>
                                    <td>{org.alternativeNames || 'N/A'}</td>
                                    <td>{org.address || 'N/A'}</td>
                                    <td>{org.taxNumber || 'N/A'}</td>
                                    <td>
                                        {Array.isArray(org.representatives) && org.representatives.length > 0
                                            ? org.representatives.map((rep, idx) => (
                                                <span key={rep.id || idx} style={{ display: 'block', color: '#2de1fc', fontWeight: 500 }}>
                                                    {rep.name || rep.legalName || 'N/A'}{rep.email ? ` (${rep.email})` : ''}
                                                </span>
                                            ))
                                            : <span style={{ color: '#b8eaff' }}>None</span>
                                        }
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

console.log('OrganizationsHubPage component loaded!');
