// Representatives Management Hub Page - Swagger-style expandable interface

const RepresentativesHubPage = () => {
    const { t } = useTranslation();
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
            title: t('representativesHubPage.section.register.title'),
            description: t('representativesHubPage.section.register.description'),
            color: '#27ae60',
            component: 'RegisterRepresentativeForm'
        },
        {
            id: 'getById',
            title: t('representativesHubPage.section.getById.title'),
            description: t('representativesHubPage.section.getById.description'),
            color: '#2980b9',
            component: 'GetRepresentativeByIdForm'
        },
        {
            id: 'edit',
            title: t('representativesHubPage.section.edit.title'),
            description: t('representativesHubPage.section.edit.description'),
            color: '#f39c12',
            component: 'EditRepresentativeForm'
        },
        {
            id: 'manageStatus',
            title: t('representativesHubPage.section.manageStatus.title'),
            description: t('representativesHubPage.section.manageStatus.description'),
            color: '#16a085',
            component: 'ActivateDeactivateRepresentativeForm'
        }
    ];

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    {t('representativesHubPage.title')}
                </h2>
                <p>{t('representativesHubPage.description')}</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button 
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    {t('representativesHubPage.quickView.button')}
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? t('representativesHubPage.quickView.arrow.up') : t('representativesHubPage.quickView.arrow.down')}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoading ? (
                            <div className="loading">{t('representativesHubPage.quickView.loading')}</div>
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
                                    {t(`sectionBadge.${section.id}`, section.id).toUpperCase()}
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
    const { t } = useTranslation();
    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>{t('representativesHubPage.quickView.overview')} ({representatives.length} {t('representativesHubPage.quickView.total')})</h4>
                <button className="refresh-btn" onClick={onRefresh}>{t('representativesHubPage.quickView.refresh')}</button>
            </div>
            {representatives.length === 0 ? (
                <div className="no-data">
                    <h3>{t('representativesHubPage.quickView.noData.title')}</h3>
                    <p>{t('representativesHubPage.quickView.noData.description')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>{t('representativesHubPage.table.id')}</th>
                                <th>{t('representativesHubPage.table.name')}</th>
                                <th>{t('representativesHubPage.table.citizenId')}</th>
                                <th>{t('representativesHubPage.table.nationality')}</th>
                                <th>{t('representativesHubPage.table.email')}</th>
                                <th>{t('representativesHubPage.table.phone')}</th>
                                <th>{t('representativesHubPage.table.status')}</th>
                                <th>{t('representativesHubPage.table.organizationId')}</th>
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
                                            {rep.isActive === true ? t('representativesHubPage.table.active') : rep.isActive === false ? t('representativesHubPage.table.inactive') : 'N/A'}
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
