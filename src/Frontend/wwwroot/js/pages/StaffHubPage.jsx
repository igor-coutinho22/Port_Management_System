// Staff Management Hub Page - Swagger-style expandable interface

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
            title: t('staffHubPage.section.register.title'),
            description: t('staffHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterStaffForm'
        },
        {
            id: 'search',
            title: t('staffHubPage.section.search.title'),
            description: t('staffHubPage.section.search.description'),
            color: '#2980b9',
            component: 'SearchStaffForm'
        },
        {
            id: 'getByNumber',
            title: t('staffHubPage.section.getByNumber.title'),
            description: t('staffHubPage.section.getByNumber.description'),
            color: '#2980b9',
            component: 'GetStaffByMecNumberForm'
        },
        {
            id: 'edit',
            title: t('staffHubPage.section.edit.title'),
            description: t('staffHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditStaffForm'
        },
        {
            id: 'delete',
            title: t('staffHubPage.section.delete.title'),
            description: t('staffHubPage.section.delete.description'),
            color: '#e74c3c',
            component: 'DeleteStaffForm'
        },
        {
            id: 'activate',
            title: t('staffHubPage.section.activate.title'),
            description: t('staffHubPage.section.activate.description'),
            color: '#2ecc71',
            component: 'ActivateStaffForm'
        },
        {
            id: 'deactivate',
            title: t('staffHubPage.section.deactivate.title'),
            description: t('staffHubPage.section.deactivate.description'),
            color: '#e67e22',
            component: 'DeactivateStaffForm'
        },
        {
            id: 'addQualification',
            title: t('staffHubPage.section.addQualification.title'),
            description: t('staffHubPage.section.addQualification.description'),
            color: '#8e44ad',
            component: 'AddQualificationToStaffForm'
        },
        {
            id: 'removeQualification',
            title: t('staffHubPage.section.removeQualification.title'),
            description: t('staffHubPage.section.removeQualification.description'),
            color: '#c0392b',
            component: 'RemoveQualificationFromStaffForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('staffHubPage.title')}
                </h2>
                <p>{t('staffHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('staffHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('staffHubPage.quickView.loading')}</div>
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
    const { t } = useTranslation();
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('staffHubPage.quickView.overview')} ({staffList.length} {t('staffHubPage.quickView.total')})</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('staffHubPage.quickView.refresh')}</button>
            </div>
            {staffList.length === 0 ? (
                <div className="no-data">
                    <h3>{t('staffHubPage.quickView.noData.title')}</h3>
                    <p>{t('staffHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('staffHubPage.table.mecanographicNumber')}</th>
                                <th>{t('staffHubPage.table.name')}</th>
                                <th>{t('staffHubPage.table.email')}</th>
                                <th>{t('staffHubPage.table.phone')}</th>
                                <th>{t('staffHubPage.table.status')}</th>
                                <th>{t('staffHubPage.table.operationalWindow')}</th>
                                <th>{t('staffHubPage.table.qualifications')}</th>
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
                                    <td>{staff.qualifications && staff.qualifications.length > 0 ? staff.qualifications.map(q => q.name).join(', ') : t('staffHubPage.table.none')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
