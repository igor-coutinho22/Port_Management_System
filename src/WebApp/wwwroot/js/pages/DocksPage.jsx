// Docks Page Component - React
const DocksPage = () => {
    const { t } = useTranslation();
    const [docks, setDocks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load docks when component mounts
    React.useEffect(() => {
        loadDocks();
    }, []);

    const loadDocks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (err) {
            console.error('Error loading docks:', err);
            setError(t('docks.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (dockName) => {
        try {
            const dock = docks.find(d => d.name === dockName);
            if (dock) {
                // Handle allowedVesselTypes collection properly
                let vesselTypes = t('docks.details.none_specified');
                if (dock.allowedVesselTypes && Array.isArray(dock.allowedVesselTypes) && dock.allowedVesselTypes.length > 0) {
                    vesselTypes = dock.allowedVesselTypes
                        .map(vt => vt.name || vt.vesselTypeName || vt)
                        .join(', ');
                } else if (dock.allowedVesselTypes && typeof dock.allowedVesselTypes === 'object') {
                    // In case it's an object with vessel type details
                    vesselTypes = Object.values(dock.allowedVesselTypes)
                        .map(vt => vt.name || vt.vesselTypeName || vt)
                        .join(', ');
                }
                
                alert(`${t('docks.details.title')}:\n\n${t('docks.details.name')}: ${dock.name || 'N/A'}\n${t('docks.details.location')}: ${dock.location || 'N/A'}\n${t('docks.details.length')}: ${dock.lengthMeters || 'N/A'}${t('docks.details.meters')}\n${t('docks.details.depth')}: ${dock.depthMeters || 'N/A'}${t('docks.details.meters')}\n${t('docks.details.max_draft')}: ${dock.maxDraftMeters || 'N/A'}${t('docks.details.meters')}\n${t('docks.details.allowed_vessels')}: ${vesselTypes}`);
            } else {
                alert(t('common.error') + ': Dock not found');
            }
        } catch (error) {
            alert(t('common.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('docks.title')}</h2>
                <div className="loading-indicator">{t('common.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('docks.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadDocks}>{t('common.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('docks.title')}</h2>
            <p>{t('docks.description')}</p>
            
            {docks.length === 0 ? (
                <div className="no-data">
                    <h3>{t('docks.no_data')}</h3>
                    <p>{t('docks.no_data_desc')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('docks.columns.code')}</th>
                                <th>{t('docks.columns.name')}</th>
                                <th>{t('docks.columns.location')}</th>
                                <th>{t('docks.details.length')} ({t('docks.details.meters')})</th>
                                <th>{t('docks.details.depth')} ({t('docks.details.meters')})</th>
                                <th>{t('docks.details.max_draft')} ({t('docks.details.meters')})</th>
                                <th>{t('docks.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docks.map((dock, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{dock.name || 'N/A'}</td>
                                    <td>{dock.location || 'N/A'}</td>
                                    <td>{dock.lengthMeters ? dock.lengthMeters.toFixed(1) : 'N/A'}</td>
                                    <td>{dock.depthMeters ? dock.depthMeters.toFixed(1) : 'N/A'}</td>
                                    <td>{dock.maxDraftMeters ? dock.maxDraftMeters.toFixed(1) : 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(dock.name)}
                                        >
                                            {t('docks.view_details')}
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

console.log('DocksPage component loaded!');