// Staff Page Component - React
const StaffPage = () => {
    const { t } = useTranslation();
    const [staff, setStaff] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load staff when component mounts
    React.useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getStaff();
            setStaff(data || []);
        } catch (err) {
            console.error('Error loading staff:', err);
            setError(t('staff.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (mecanographicNumber) => {
        try {
            const staffMember = staff.find(s => s.mecanographicNumber === mecanographicNumber);
            if (staffMember) {
                const qualifications = staffMember.qualifications ? 
                    staffMember.qualifications.map(q => `${q.name} (${q.code})`).join(', ') : 
                    t('staff.details.none');
                alert(`${t('staff.details.title')}:\n\n${t('staff.details.mecanographic_number')}: ${staffMember.mecanographicNumber}\n${t('staff.details.name')}: ${staffMember.shortName}\n${t('staff.details.email')}: ${staffMember.email}\n${t('staff.details.phone')}: ${staffMember.phone}\n${t('staff.details.status')}: ${staffMember.status}\n${t('staff.details.operational_window')}: ${staffMember.operationalWindow}\n${t('staff.details.qualifications')}: ${qualifications}`);
            } else {
                alert(t('staff.details.not_found'));
            }
        } catch (error) {
            alert(t('staff.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('staff.title')}</h2>
                <div className="loading-indicator">{t('staff.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('staff.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadStaff}>{t('staff.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('staff.title')}</h2>
            <p>{t('staff.description')}</p>
            
            {staff.length === 0 ? (
                <div className="no-data">
                    <h3>{t('staff.no_data.title')}</h3>
                    <p>{t('staff.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('staff.columns.mecanographic')}</th>
                                <th>{t('staff.columns.name')}</th>
                                <th>{t('staff.columns.email')}</th>
                                <th>{t('staff.columns.phone')}</th>
                                <th>{t('staff.columns.status')}</th>
                                <th>{t('staff.columns.operational_window')}</th>
                                <th>{t('staff.columns.qualifications')}</th>
                                <th>{t('staff.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((staffMember, index) => (
                                <tr key={index}>
                                    <td>{staffMember.mecanographicNumber || 'N/A'}</td>
                                    <td>{staffMember.shortName || 'N/A'}</td>
                                    <td>{staffMember.email || 'N/A'}</td>
                                    <td>{staffMember.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(staffMember.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {staffMember.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{staffMember.operationalWindow || 'N/A'}</td>
                                    <td>{staffMember.qualifications ? staffMember.qualifications.length : 0}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(staffMember.mecanographicNumber)}
                                        >
                                            {t('staff.view_details')}
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

console.log('StaffPage component loaded!');