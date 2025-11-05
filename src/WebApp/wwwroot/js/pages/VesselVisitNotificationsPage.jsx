// Vessel Visit Notifications Page Component - React
const VesselVisitNotificationsPage = () => {
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
            setError('Error loading vessel visit notifications. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (notificationId) => {
        try {
            const notification = await apiService.getVesselVisitNotificationById(notificationId);
            alert(`Notification Details:\n\nID: ${notification.id}\nVessel ID: ${notification.vesselId}\nExpected Arrival: ${notification.expectedArrivalTime}\nExpected Departure: ${notification.expectedDepartureTime}\nPurpose: ${notification.purpose}\nStatus: ${notification.status}`);
        } catch (error) {
            alert('Error loading notification details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Visit Notifications</h2>
                <div className="loading-indicator">Loading notifications...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Visit Notifications</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadNotifications}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Vessel Visit Notifications</h2>
            <p>View and manage notifications for upcoming vessel visits and port operations.</p>
            
            {notifications.length === 0 ? (
                <div className="no-data">
                    <h3>No Notifications Found</h3>
                    <p>There are currently no vessel visit notifications in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Vessel ID</th>
                                <th>Expected Arrival</th>
                                <th>Expected Departure</th>
                                <th>Purpose</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map(notification => (
                                <tr key={notification.id}>
                                    <td>{notification.id || 'N/A'}</td>
                                    <td>{notification.vesselId || 'N/A'}</td>
                                    <td>{notification.expectedArrivalTime ? new Date(notification.expectedArrivalTime).toLocaleString() : 'N/A'}</td>
                                    <td>{notification.expectedDepartureTime ? new Date(notification.expectedDepartureTime).toLocaleString() : 'N/A'}</td>
                                    <td>{notification.purpose || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(notification.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {notification.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(notification.id)}
                                        >
                                            View Details
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