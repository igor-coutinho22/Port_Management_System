// Qualifications Page Component - React
const QualificationsPage = () => {
    const { t } = useTranslation();
    const [qualifications, setQualifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load qualifications when component mounts
    React.useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getQualifications();
            setQualifications(data || []);
        } catch (err) {
            console.error('Error loading qualifications:', err);
            setError(t('qualifications.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (qualificationCode) => {
        try {
            const qualification = qualifications.find(q => q.code === qualificationCode);
            if (qualification) {
                alert(`${t('qualifications.details.title')}:\n\n${t('qualifications.details.code')}: ${qualification.code}\n${t('qualifications.details.name')}: ${qualification.name}`);
            } else {
                alert(t('qualifications.details.not_found'));
            }
        } catch (error) {
            alert(t('qualifications.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('qualifications.title')}</h2>
                <div className="loading-indicator">{t('qualifications.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('qualifications.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadQualifications}>{t('qualifications.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('qualifications.title')}</h2>
            <p>{t('qualifications.description')}</p>
            
            {qualifications.length === 0 ? (
                <div className="no-data">
                    <h3>{t('qualifications.no_data.title')}</h3>
                    <p>{t('qualifications.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('qualifications.columns.code')}</th>
                                <th>{t('qualifications.columns.name')}</th>
                                <th>{t('qualifications.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualifications.map((qualification, index) => (
                                <tr key={index}>
                                    <td>{qualification.code || 'N/A'}</td>
                                    <td>{qualification.name || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(qualification.code)}
                                        >
                                            {t('qualifications.view_details')}
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

console.log('QualificationsPage component loaded!');