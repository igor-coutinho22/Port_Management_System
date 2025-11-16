// Staff Management Hub Page - Swagger-style expandable interface
console.log('StaffHubPage.jsx is loading...');

const StaffHubPage = () => {
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [staffList, setStaffList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showQuickView, setShowQuickView] = React.useState(false);

    // Toggle section expansion
    const toggleSection = (sectionName) => {
        setExpandedSection(expandedSection === sectionName ? null : sectionName);
    };

    // Load all staff for quick view
    const loadStaff = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getStaff();
            setStaffList(data);
        } catch (error) {
            console.error('Error loading staff:', error);
            setStaffList([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load staff when quick view is opened
    React.useEffect(() => {
        if (showQuickView) {
            loadStaff();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'register',
            title: `📝 Register Staff`,
            description: 'Create a new staff member with details and operational window',
            color: '#27ae60',
            component: 'RegisterStaffForm'
        },
        {
            id: 'search',
            title: `🔍 Search Staff`,
            description: 'Search for staff members by various criteria',
            color: '#2980b9',
            component: 'SearchStaffForm'
        },
        {
            id: 'getByNumber',
            title: `🎯 Get Staff by Mecanographic Number`,
            description: 'Retrieve detailed information about a specific staff member',
            color: '#2980b9',
            component: 'GetStaffByMecNumberForm'
        },
        {
            id: 'edit',
            title: `✏️ Edit Staff`,
            description: 'Update staff details and operational window',
            color: '#f39c12',
            component: 'EditStaffForm'
        },
        {
            id: 'delete',
            title: `🗑️ Delete Staff`,
            description: 'Remove a staff member from the system',
            color: '#e74c3c',
            component: 'DeleteStaffForm'
        },
        {
            id: 'activate',
            title: `✅ Activate Staff`,
            description: 'Set staff status to available',
            color: '#2ecc71',
            component: 'ActivateStaffForm'
        },
        {
            id: 'deactivate',
            title: `🚫 Deactivate Staff`,
            description: 'Set staff status to unavailable',
            color: '#e67e22',
            component: 'DeactivateStaffForm'
        },
        {
            id: 'addQualification',
            title: `➕ Add Qualification to Staff`,
            description: 'Add a qualification to a staff member',
            color: '#8e44ad',
            component: 'AddQualificationToStaffForm'
        },
        {
            id: 'removeQualification',
            title: `➖ Remove Qualification from Staff`,
            description: 'Remove a qualification from a staff member',
            color: '#c0392b',
            component: 'RemoveQualificationFromStaffForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    👨‍✈️ Staff Management
                </h2>
                <p>Comprehensive staff management system for port operations</p>
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
                            <div className="loading">Loading staff...</div>
                        ) : (
                            <StaffQuickTable staffList={staffList} onRefresh={loadStaff} />
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
                                    {section.component === 'RegisterStaffForm' && <RegisterStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'SearchStaffForm' && <SearchStaffForm />}
                                    {section.component === 'GetStaffByMecNumberForm' && <GetStaffByMecNumberForm />}
                                    {section.component === 'EditStaffForm' && <EditStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'DeleteStaffForm' && <DeleteStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'ActivateStaffForm' && <ActivateStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'DeactivateStaffForm' && <DeactivateStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'AddQualificationToStaffForm' && <AddQualificationToStaffForm onSuccess={loadStaff} />}
                                    {section.component === 'RemoveQualificationFromStaffForm' && <RemoveQualificationFromStaffForm onSuccess={loadStaff} />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Quick Table Component for Staff Data
const StaffQuickTable = ({ staffList, onRefresh }) => {
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Staff Overview ({staffList.length} total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            {staffList.length === 0 ? (
                <div className="no-data">
                    <h3>No staff found</h3>
                    <p>Register your first staff member to get started</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>Mecanographic Number</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Operational Window</th>
                                <th>Qualifications</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff) => (
                                <tr key={staff.mecanographicNumber}>
                                    <td>{staff.mecanographicNumber}</td>
                                    <td>{staff.shortName}</td>
                                    <td>{staff.email}</td>
                                    <td>{staff.phone}</td>
                                    <td>
                                        <span className={`status-badge status-${(staff.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {staff.status || 'N/A'}
                                    </span>
                                    </td>
                                    <td>{staff.operationalWindow}</td>
                                    <td>{staff.qualifications && staff.qualifications.length > 0 ? staff.qualifications.map(q => q.name).join(', ') : 'None'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

console.log('StaffHubPage component loaded!');
