// Organizations Page Component - React
const OrganizationsPage = () => {
    const { t } = useTranslation();
    const [organizations, setOrganizations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load organizations when component mounts
    React.useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getOrganizations();
            setOrganizations(data || []);
        } catch (err) {
            console.error('Error loading organizations:', err);
            setError(t('organizations.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (organizationId) => {
        try {
            const org = organizations.find(o => o.id === organizationId);
            if (org) {
                // Handle representatives collection properly
                let representatives = t('organizations.details.none');
                if (org.representatives && Array.isArray(org.representatives) && org.representatives.length > 0) {
                    representatives = org.representatives
                        .map(rep => rep.name || rep.fullName || rep.firstName + ' ' + rep.lastName || rep)
                        .join(', ');
                } else if (org.representatives && typeof org.representatives === 'object') {
                    // In case it's an object with representative details
                    representatives = Object.values(org.representatives)
                        .map(rep => rep.name || rep.fullName || rep.firstName + ' ' + rep.lastName || rep)
                        .join(', ');
                }
                
                alert(`${t('organizations.details.title')}:\n\n${t('organizations.details.id')}: ${org.id || 'N/A'}\n${t('organizations.details.legal_name')}: ${org.legalName || 'N/A'}\n${t('organizations.details.alternative_names')}: ${org.alternativeNames || t('organizations.details.none')}\n${t('organizations.details.address')}: ${org.address || 'N/A'}\n${t('organizations.details.tax_number')}: ${org.taxNumber || 'N/A'}\n${t('organizations.details.representatives')}: ${representatives}`);
            } else {
                alert(t('organizations.details.not_found'));
            }
        } catch (error) {
            alert(t('organizations.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('organizations.title')}</h2>
                <div className="loading-indicator">{t('organizations.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('organizations.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadOrganizations}>{t('organizations.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('organizations.title')}</h2>
            <p>{t('organizations.description')}</p>
            
            {organizations.length === 0 ? (
                <div className="no-data">
                    <h3>{t('organizations.no_data.title')}</h3>
                    <p>{t('organizations.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('organizations.table.id')}</th>
                                <th>{t('organizations.table.legal_name')}</th>
                                <th>{t('organizations.table.alternative_names')}</th>
                                <th>{t('organizations.table.address')}</th>
                                <th>{t('organizations.table.tax_number')}</th>
                                <th>{t('organizations.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.id}>
                                    <td>{org.id || 'N/A'}</td>
                                    <td>{org.legalName || 'N/A'}</td>
                                    <td>{org.alternativeNames || 'N/A'}</td>
                                    <td>{org.address || 'N/A'}</td>
                                    <td>{org.taxNumber || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(org.id)}
                                        >
                                            {t('organizations.table.view_details')}
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

console.log('OrganizationsPage component loaded!');