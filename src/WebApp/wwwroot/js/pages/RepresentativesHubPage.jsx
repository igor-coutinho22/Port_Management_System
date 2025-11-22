// Representatives Management Hub Page - Swagger-style expandable interface
console.log('RepresentativesHubPage.jsx is loading...');

const RepresentativesHubPage = () => {
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [representatives, setRepresentatives] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all representatives for quick view
    const loadRepresentatives = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getRepresentatives();
            setRepresentatives(data);
        } catch (error) {
            console.error('Error loading representatives:', error);
            setRepresentatives([]);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (showQuickView) {
            loadRepresentatives();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: `📝 Register Representative`,
            description: 'Create a new representative for an organization',
            color: '#27ae60',
            component: 'RegisterRepresentativeForm'
        },
        {
            id: 'getById',
            title: `🎯 Get Representative by ID`,
            description: 'Retrieve detailed information about a specific representative',
            color: '#2980b9',
            component: 'GetRepresentativeByIdForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Representative`,
            description: 'Update representative details',
            color: '#f39c12',
            component: 'EditRepresentativeForm'
        },
        {
            id: 'manageStatus',
            title: `Activate/Deactivate Representative`,
            description: 'Change the active status of a representative',
            color: '#16a085',
            component: 'ActivateDeactivateRepresentativeForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    👤 Representatives Management
                </h2>
                <p>Comprehensive representative management system for port operations</p>
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
                            <div className="loading">Loading representatives...</div>
                        ) : (
                            <RepresentativesQuickTable representatives={representatives} onRefresh={loadRepresentatives} />
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
                                    {section.component === 'RegisterRepresentativeForm' && <RegisterRepresentativeForm onSuccess={loadRepresentatives} />}
                                    {section.component === 'GetRepresentativeByIdForm' && <GetRepresentativeByIdForm />}
                                    {section.component === 'EditRepresentativeForm' && <EditRepresentativeForm onSuccess={loadRepresentatives} />}
                                    {section.component === 'ActivateDeactivateRepresentativeForm' && <ActivateDeactivateRepresentativeForm onSuccess={loadRepresentatives} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Representatives Data
const RepresentativesQuickTable = ({ representatives, onRefresh }) => {
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Representatives Overview ({representatives.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            {representatives.length === 0 ? (
                <div className="no-data">
                    <h3>No representatives found</h3>
                    <p>Register your first representative to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Citizen ID</th>
                                <th>Nationality</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Organization</th>
                            </tr>
                        </thead>
                        <tbody>
                            {representatives.map((rep) => (
                                <tr key={rep.id || rep.name}>
                                    <td className="id-cell">{rep.id || 'N/A'}</td>
                                    <td className="name-cell">{rep.name || 'N/A'}</td>
                                    <td>{rep.citizenId || 'N/A'}</td>
                                    <td>{rep.nationality || 'N/A'}</td>
                                    <td>{rep.email || 'N/A'}</td>
                                    <td>{rep.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${rep.isActive === true ? 'true' : 'false'}`}>
                                            {rep.isActive === true ? 'Active' : rep.isActive === false ? 'Inactive' : 'N/A'}
                                        </span>
                                    </td>
                                    <td>{rep.organizationId || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('RepresentativesHubPage component loaded!');
