// Resources Page Component - React
const ResourcesPage = () => {
    const { t } = useTranslation();
    const [resources, setResources] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load resources when component mounts
    React.useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getResources();
            setResources(data || []);
        } catch (err) {
            console.error('Error loading resources:', err);
            setError(t('resources.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualificationRequirements HashSet properly
            let qualifications = t('resources.details.none');
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q)
                    .join(', ');
            } else if (resource.qualificationRequirements && typeof resource.qualificationRequirements === 'object') {
                // In case it's an object with qualification details
                qualifications = Object.values(resource.qualificationRequirements)
                    .map(q => q.name || q.code || q)
                    .join(', ');
            }
            
            alert(`${t('resources.details.title')}:\n\n${t('resources.details.id')}: ${resource.id || 'N/A'}\n${t('resources.details.description')}: ${resource.description || 'N/A'}\n${t('resources.details.type')}: ${resource.resourceType || 'N/A'}\n${t('resources.details.status')}: ${resource.status || 'N/A'}\n${t('resources.details.capacity')}: ${resource.operationalCapacity || 'N/A'}\n${t('resources.details.setup_time')}: ${resource.setupTime || 'N/A'} ${t('resources.details.minutes')}\n${t('resources.details.qualifications')}: ${qualifications}`);
        } catch (error) {
            alert(t('common.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('resources.title')}</h2>
                <div className="loading-indicator">{t('common.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('resources.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadResources}>{t('common.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('resources.title')}</h2>
            <p>{t('resources.description')}</p>
            
            {resources.length === 0 ? (
                <div className="no-data">
                    <h3>{t('resources.no_data')}</h3>
                    <p>{t('resources.no_data_desc')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('resources.columns.code')}</th>
                                <th>{t('resources.columns.name')}</th>
                                <th>{t('resources.columns.type')}</th>
                                <th>{t('resources.columns.status')}</th>
                                <th>{t('resources.columns.capacity')}</th>
                                <th>{t('resources.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(resource => (
                                <tr key={resource.id}>
                                    <td>{resource.id || 'N/A'}</td>
                                    <td>{resource.description || 'N/A'}</td>
                                    <td>{resource.resourceType || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {resource.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{resource.operationalCapacity || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(resource.id)}
                                        >
                                            {t('resources.view_details')}
                                        </button>
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