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
                const obtainedDate = qualification.dateObtained ? new Date(qualification.dateObtained).toLocaleDateString() : t('qualifications.details.not_specified');
                const expiryDate = qualification.expiryDate ? new Date(qualification.expiryDate).toLocaleDateString() : t('qualifications.details.no_expiry');
                const isValid = qualification.expiryDate ? new Date(qualification.expiryDate) > new Date() : true;
                const status = isValid ? t('qualifications.details.valid') : t('qualifications.details.expired');
                alert(`${t('qualifications.details.title')}:\n\n${t('qualifications.details.code')}: ${qualification.code}\n${t('qualifications.details.name')}: ${qualification.name}\n${t('qualifications.details.date_obtained')}: ${obtainedDate}\n${t('qualifications.details.expiry_date')}: ${expiryDate}\n${t('qualifications.details.status')}: ${status}`);
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
                                <th>{t('qualifications.columns.date_obtained')}</th>
                                <th>{t('qualifications.columns.expiry_date')}</th>
                                <th>{t('qualifications.columns.status')}</th>
                                <th>{t('qualifications.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualifications.map((qualification, index) => (
                                <tr key={index}>
                                    <td>{qualification.code || 'N/A'}</td>
                                    <td>{qualification.name || 'N/A'}</td>
                                    <td>{qualification.dateObtained ? new Date(qualification.dateObtained).toLocaleDateString() : 'N/A'}</td>
                                    <td>{qualification.expiryDate ? new Date(qualification.expiryDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${qualification.expiryDate && new Date(qualification.expiryDate) > new Date() ? 'status-valid' : 'status-expired'}`}>
                                            {qualification.expiryDate && new Date(qualification.expiryDate) > new Date() ? t('qualifications.columns.valid') : t('qualifications.columns.expired')}
                                        </span>
                                    </td>
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