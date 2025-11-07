// VesselTypes Page Component - React
const VesselTypesPage = () => {
    const { t } = useTranslation();
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load vessel types when component mounts
    React.useEffect(() => {
        loadVesselTypes();
    }, []);

    const loadVesselTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getVesselTypes();
            setVesselTypes(data || []);
        } catch (err) {
            console.error('Error loading vessel types:', err);
            setError(t('vessel_types.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (vesselTypeName) => {
        try {
            const vesselType = vesselTypes.find(vt => vt.name === vesselTypeName);
            if (vesselType) {
                alert(`${t('vessel_types.details.title')}:\n\n${t('vessel_types.details.name')}: ${vesselType.name}\n${t('vessel_types.details.description')}: ${vesselType.description || 'N/A'}\n${t('vessel_types.details.max_bays')}: ${vesselType.maxBays || 'N/A'}\n${t('vessel_types.details.max_rows')}: ${vesselType.maxRows || 'N/A'}\n${t('vessel_types.details.max_tiers')}: ${vesselType.maxTiers || 'N/A'}\n${t('vessel_types.details.max_teu')}: ${vesselType.maxTEUCapacity || 'N/A'}`);
            } else {
                alert(t('common.error') + ': Vessel type not found');
            }
        } catch (error) {
            alert(t('common.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('vessel_types.title')}</h2>
                <div className="loading-indicator">{t('common.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('vessel_types.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadVesselTypes}>{t('common.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('vessel_types.title')}</h2>
            <p>{t('vessel_types.description')}</p>
            
            {vesselTypes.length === 0 ? (
                <div className="no-data">
                    <h3>{t('vessel_types.no_data')}</h3>
                    <p>{t('vessel_types.no_data_desc')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('vessel_types.columns.code')}</th>
                                <th>{t('vessel_types.columns.name')}</th>
                                <th>{t('vessel_types.columns.description')}</th>
                                <th>{t('vessel_types.details.max_bays')}</th>
                                <th>{t('vessel_types.details.max_rows')}</th>
                                <th>{t('vessel_types.details.max_tiers')}</th>
                                <th>{t('vessel_types.columns.max_teu')}</th>
                                <th>{t('vessel_types.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vesselTypes.map((vesselType, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{vesselType.name || 'N/A'}</td>
                                    <td>{vesselType.description || 'N/A'}</td>
                                    <td>{vesselType.maxBays || 'N/A'}</td>
                                    <td>{vesselType.maxRows || 'N/A'}</td>
                                    <td>{vesselType.maxTiers || 'N/A'}</td>
                                    <td>{vesselType.maxTEUCapacity || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(vesselType.name)}
                                        >
                                            {t('vessel_types.view_details')}
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

console.log('VesselTypesPage component loaded!');