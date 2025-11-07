// Vessel Visit Notifications Page Component - React
const VesselVisitNotificationsPage = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load vessel visit notifications when component mounts
    React.useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getVesselVisitNotifications();
            setNotifications(data || []);
        } catch (err) {
            console.error('Error loading vessel visit notifications:', err);
            setError(t('notifications.error_loading'));
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (notificationId) => {
        try {
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                const loadingManifest = notification.loadingManifest ? `${t('notifications.details.type')}: ${notification.loadingManifest.type}` : t('notifications.details.none');
                const unloadingManifest = notification.unloadingManifest ? `${t('notifications.details.type')}: ${notification.unloadingManifest.type}` : t('notifications.details.none');
                const crewInfo = notification.crew ? notification.crew.length + ' ' + t('notifications.details.members') : t('notifications.details.no_crew_data');
                alert(`${t('notifications.details.title')}:\n\n${t('notifications.details.id')}: ${notification.id}\n${t('notifications.details.vessel_imo')}: ${notification.vesselIMO}\n${t('notifications.details.dock_id')}: ${notification.dockId}\n${t('notifications.details.visit_date')}: ${new Date(notification.visitDate).toLocaleDateString()}\n${t('notifications.details.purpose')}: ${notification.purpose}\n${t('notifications.details.status')}: ${notification.status}\n${t('notifications.details.loading_manifest')}: ${loadingManifest}\n${t('notifications.details.unloading_manifest')}: ${unloadingManifest}\n${t('notifications.details.crew')}: ${crewInfo}`);
            } else {
                alert(t('notifications.details.not_found'));
            }
        } catch (error) {
            alert(t('notifications.details.error') + ': ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('notifications.title')}</h2>
                <div className="loading-indicator">{t('notifications.loading')}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t('notifications.title')}</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadNotifications}>{t('notifications.retry')}</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">{t('notifications.title')}</h2>
            <p>{t('notifications.description')}</p>
            
            {notifications.length === 0 ? (
                <div className="no-data">
                    <h3>{t('notifications.no_data.title')}</h3>
                    <p>{t('notifications.no_data.message')}</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('notifications.columns.id')}</th>
                                <th>{t('notifications.columns.vessel_imo')}</th>
                                <th>{t('notifications.columns.dock_id')}</th>
                                <th>{t('notifications.columns.visit_date')}</th>
                                <th>{t('notifications.columns.purpose')}</th>
                                <th>{t('notifications.columns.status')}</th>
                                <th>{t('notifications.columns.crew_size')}</th>
                                <th>{t('notifications.columns.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map(notification => (
                                <tr key={notification.id}>
                                    <td>{notification.id || 'N/A'}</td>
                                    <td>{notification.vesselIMO || 'N/A'}</td>
                                    <td>{notification.dockId || 'N/A'}</td>
                                    <td>{notification.visitDate ? new Date(notification.visitDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{notification.purpose || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(notification.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {notification.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{notification.crew ? notification.crew.length : 0}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(notification.id)}
                                        >
                                            {t('notifications.view_details')}
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

console.log('VesselVisitNotificationsPage component loaded!');