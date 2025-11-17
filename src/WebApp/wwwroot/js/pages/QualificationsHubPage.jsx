// Qualifications Management Hub Page - Swagger-style expandable interface
console.log('QualificationsHubPage.jsx is loading...');

const QualificationsHubPage = () => {
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [qualifications, setQualifications] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all qualifications for quick view
    const loadQualifications = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getQualifications();
            setQualifications(data);
        } catch (error) {
            console.error('Error loading qualifications:', error);
            setQualifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load qualifications when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadQualifications();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: `📝 Register Qualification`,
            description: 'Create a new qualification with code and name',
            color: '#27ae60',
            component: 'RegisterQualificationForm'
        },
        {
            id: 'getByCode',
            title: `🎯 Get Qualification by Code`,
            description: 'Retrieve details about a specific qualification',
            color: '#2980b9',
            component: 'GetQualificationByCodeForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Qualification`,
            description: 'Update qualification name',
            color: '#f39c12',
            component: 'EditQualificationForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Qualification`,
            description: 'Remove a qualification from the system',
            color: '#e74c3c',
            component: 'DeleteQualificationForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">🎓 Qualifications Management</h2>
                <p>Comprehensive qualifications management system for port operations</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    Quick Data View
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>{showQuickView ? '▲' : '▼'}</span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">Loading qualifications...</div>
                        ) : (
                            <QualificationsQuickTable qualifications={qualifications} onRefresh={loadQualifications} />
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
                                <span className={`expand-arrow ${expandedSection === section.id ? 'up' : 'down'}`}>{expandedSection === section.id ? '▲' : '▼'}</span>
                            </div>
                        </div>

                        {expandedSection === section.id && (
                            <div className="operation-content">
                                <div className="operation-body">
                                    {section.component === 'RegisterQualificationForm' && <RegisterQualificationForm onSuccess={loadQualifications} />}
                                    {section.component === 'GetQualificationByCodeForm' && <GetQualificationByCodeForm />}
                                    {section.component === 'EditQualificationForm' && <EditQualificationForm onSuccess={loadQualifications} />}
                                    {section.component === 'DeleteQualificationForm' && <DeleteQualificationForm onSuccess={loadQualifications} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Qualifications Data
const QualificationsQuickTable = ({ qualifications, onRefresh }) => {
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Qualifications Overview ({qualifications.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            {qualifications.length === 0 ? (
                <div className="no-data">
                    <h3>No qualifications found</h3>
                    <p>Register your first qualification to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualifications.map((q) => (
                                <tr key={q.code}>
                                    <td className="code-cell">{q.code || 'N/A'}</td>
                                    <td className="name-cell">{q.name || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('QualificationsHubPage component loaded!');
