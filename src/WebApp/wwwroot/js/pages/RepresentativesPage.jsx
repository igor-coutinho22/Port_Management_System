// Representatives Page Component - React
const RepresentativesPage = () => {
    const { t } = useTranslation();
    const [representatives, setRepresentatives] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load representatives when component mounts
    React.useEffect(() => {
        loadRepresentatives();
    }, []);

    const loadRepresentatives = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getRepresentatives();
            setRepresentatives(data || []);
        } catch (err) {
            console.error('Error loading representatives:', err);
            setError(t('representatives.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (representativeId) => {
        try {
            const representative = representatives.find(r => r.id === representativeId);
            if (representative) {
                const status = representative.isActive ? t('representatives.details.active') : t('representatives.details.inactive');
                alert(`${t('representatives.details.title')}:\n\n${t('representatives.details.id')}: ${representative.id}\n${t('representatives.details.name')}: ${representative.name}\n${t('representatives.details.citizen_id')}: ${representative.citizenId}\n${t('representatives.details.nationality')}: ${representative.nationality}\n${t('representatives.details.email')}: ${representative.email}\n${t('representatives.details.phone')}: ${representative.phone}\n${t('representatives.details.organization_id')}: ${representative.organizationId}\n${t('representatives.details.status')}: ${status}`);
            } else {
                alert(t('representatives.details.not_found'));
            }
        } catch (error) {
            alert(t('representatives.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('representatives.title')}</h2>
                <div className="loading-indicator">{t('representatives.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('representatives.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadRepresentatives}>{t('representatives.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('representatives.title')}</h2>
            <p>{t('representatives.description')}</p>
            
            {representatives.length === 0 ? (
                <div className="no-data">
                    <h3>{t('representatives.no_data.title')}</h3>
                    <p>{t('representatives.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('representatives.columns.id')}</th>
                                <th>{t('representatives.columns.name')}</th>
                                <th>{t('representatives.columns.citizen_id')}</th>
                                <th>{t('representatives.columns.nationality')}</th>
                                <th>{t('representatives.columns.email')}</th>
                                <th>{t('representatives.columns.phone')}</th>
                                <th>{t('representatives.columns.status')}</th>
                                <th>{t('representatives.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {representatives.map(representative => (
                                <tr key={representative.id}>
                                    <td>{representative.id || 'N/A'}</td>
                                    <td>{representative.name || 'N/A'}</td>
                                    <td>{representative.citizenId || 'N/A'}</td>
                                    <td>{representative.nationality || 'N/A'}</td>
                                    <td>{representative.email || 'N/A'}</td>
                                    <td>{representative.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${representative.isActive ? 'active' : 'inactive'}`}>
                                            {representative.isActive ? t('representatives.columns.active') : t('representatives.columns.inactive')}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(representative.id)}
                                        >
                                            {t('representatives.view_details')}
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

console.log('RepresentativesPage component loaded!');