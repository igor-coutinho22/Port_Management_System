// Vessels Page Component - React
const VesselsPage = () => {
    const { t } = useTranslation();
    const [vessels, setVessels] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load vessels when component mounts
    React.useEffect(() => {
        loadVessels();
    }, []);

    const loadVessels = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getVessels();
            setVessels(data || []);
        } catch (err) {
            console.error('Error loading vessels:', err);
            setError(t('vessels.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (vesselImo) => {
        try {
            const vessel = await apiService.getVesselByImo(vesselImo);
            alert(`${t('vessels.details.title')}:\n\n${t('vessels.details.imo')}: ${vessel.IMO || vessel.imo}\n${t('vessels.details.name')}: ${vessel.VesselName || vessel.vesselName}\n${t('vessels.details.operator')}: ${vessel.OperatorName || vessel.operatorName}\n${t('vessels.details.type')}: ${vessel.VesselTypeName || vessel.vesselTypeName}\n${t('vessels.details.crane_count')}: ${vessel.RequiredCraneCount || vessel.requiredCraneCount}\n${t('vessels.details.dock_length')}: ${vessel.RequiredDockLength || vessel.requiredDockLength}\n${t('vessels.details.bays')}: ${vessel.Bays || vessel.bays}\n${t('vessels.details.rows')}: ${vessel.Rows || vessel.rows}\n${t('vessels.details.tiers')}: ${vessel.Tiers || vessel.tiers}`);
        } catch (error) {
            alert(t('common.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('vessels.title')}</h2>
                <div className="loading-indicator">{t('common.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('vessels.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadVessels}>{t('common.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('vessels.title')}</h2>
            <p>{t('vessels.description')}</p>
            
            {vessels.length === 0 ? (
                <div className="no-data">
                    <h3>{t('vessels.no_data')}</h3>
                    <p>{t('vessels.no_data_desc')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('vessels.columns.imo')}</th>
                                <th>{t('vessels.columns.name')}</th>
                                <th>{t('vessels.columns.operator')}</th>
                                <th>{t('vessels.columns.type')}</th>
                                <th>{t('vessels.columns.crane_count')}</th>
                                <th>{t('vessels.columns.dock_length')}</th>
                                <th>{t('vessels.columns.dimensions')}</th>
                                <th>{t('vessels.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vessels.map(vessel => (
                                <tr key={vessel.imo}>
                                    <td>{vessel.imo || 'N/A'}</td>
                                    <td>{vessel.vesselName || 'N/A'}</td>
                                    <td>{vessel.operatorName || 'N/A'}</td>
                                    <td>{vessel.vesselTypeName || 'N/A'}</td>
                                    <td>{vessel.requiredCraneCount || 'N/A'}</td>
                                    <td>{vessel.requiredDockLength || 'N/A'}</td>
                                    <td>
                                        {(vessel.bays || 0)}×{(vessel.rows || 0)}×{(vessel.tiers || 0)}
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(vessel.imo)}
                                        >
                                            {t('vessels.view_details')}
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