// Storage Areas Page Component - React
const StorageAreasPage = () => {
    const { t } = useTranslation();
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load storage areas when component mounts
    React.useEffect(() => {
        loadStorageAreas();
    }, []);

    const loadStorageAreas = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getStorageAreas();
            setStorageAreas(data || []);
        } catch (err) {
            console.error('Error loading storage areas:', err);
            setError(t('storage_areas.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (storageAreaId) => {
        try {
            const area = storageAreas.find(a => a.id === storageAreaId);
            if (area) {
                const utilizationPercent = area.maxCapacityTeu ? Math.round((area.currentOccupancyTeu / area.maxCapacityTeu) * 100) : 0;
                
                // Build specialized information based on storage area type and available properties
                let specializedInfo = '';
                
                if (area.type === 'Warehouse' || area.type === 'warehouse') {
                    if (area.specializedCargoType) {
                        specializedInfo = `\n${t('storage_areas.details.specialized_cargo')}: ${area.specializedCargoType}`;
                    } else {
                        specializedInfo = `\n${t('storage_areas.details.specialized_cargo')}: ${t('storage_areas.details.not_specified')}`;
                    }
                } else if (area.type === 'ContainerYard' || area.type === 'containerYard') {
                    if (area.dockIds && area.dockIds.length > 0) {
                        specializedInfo = `\n${t('storage_areas.details.docks_served')}: ${area.dockIds.length} ${t('storage_areas.details.dock_count')} (${t('storage_areas.details.ids')}: ${area.dockIds.join(', ')})`;
                    } else {
                        specializedInfo = `\n${t('storage_areas.details.docks_served')}: ${t('storage_areas.details.none_configured')}`;
                    }
                }
                
                alert(`${t('storage_areas.details.title')}:\n\n${t('storage_areas.details.id')}: ${area.id || 'N/A'}\n${t('storage_areas.details.name')}: ${area.name || 'N/A'}\n${t('storage_areas.details.type')}: ${area.type || 'N/A'}\n${t('storage_areas.details.max_capacity')}: ${area.maxCapacityTeu || 'N/A'} ${t('storage_areas.details.teu')}\n${t('storage_areas.details.current_occupancy')}: ${area.currentOccupancyTeu || 'N/A'} ${t('storage_areas.details.teu')}\n${t('storage_areas.details.utilization')}: ${utilizationPercent}%${specializedInfo}`);
            } else {
                alert(t('storage_areas.details.not_found'));
            }
        } catch (error) {
            alert(t('storage_areas.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('storage_areas.title')}</h2>
                <div className="loading-indicator">{t('storage_areas.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('storage_areas.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadStorageAreas}>{t('storage_areas.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('storage_areas.title')}</h2>
            <p>{t('storage_areas.description')}</p>
            
            {storageAreas.length === 0 ? (
                <div className="no-data">
                    <h3>{t('storage_areas.no_data.title')}</h3>
                    <p>{t('storage_areas.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('storage_areas.columns.code')}</th>
                                <th>{t('storage_areas.columns.name')}</th>
                                <th>{t('storage_areas.columns.type')}</th>
                                <th>{t('storage_areas.columns.capacity')}</th>
                                <th>{t('storage_areas.columns.current_occupancy')}</th>
                                <th>{t('storage_areas.columns.utilization')}</th>
                                <th>{t('storage_areas.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map(area => (
                                <tr key={area.id}>
                                    <td>{area.id || 'N/A'}</td>
                                    <td>{area.name || 'N/A'}</td>
                                    <td>{area.type || 'N/A'}</td>
                                    <td>{area.maxCapacityTeu || 'N/A'}</td>
                                    <td>{area.currentOccupancyTeu || 'N/A'}</td>
                                    <td>{area.maxCapacityTeu ? Math.round((area.currentOccupancyTeu / area.maxCapacityTeu) * 100) : 'N/A'}%</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(area.id)}
                                        >
                                            {t('storage_areas.view_details')}
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

console.log('StorageAreasPage component loaded!');