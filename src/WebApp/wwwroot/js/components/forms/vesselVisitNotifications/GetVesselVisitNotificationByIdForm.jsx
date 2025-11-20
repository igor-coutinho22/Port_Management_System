// Get Vessel Visit Notification by ID Form Component
console.log('GetVesselVisitNotificationByIdForm component loading...');

const GetVesselVisitNotificationByIdForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [notification, setNotification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Notification ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid notification ID (e.g., 12345678-1234-1234-1234-123456789abc)' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setNotification(null);
        try {
            const data = await apiService.getVesselVisitNotificationById(searchData.id.trim());
            if (data) {
                setNotification(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Notification found successfully' });
            } else {
                setNotification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Notification not found' });
            }
        } catch (error) {
            console.error('Error fetching notification:', error);
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Notification not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch notification. Please try again.' });
            }
            setNotification(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setNotification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Vessel Visit Notification by ID</h4>
                <p>Retrieve detailed information about a specific vessel visit notification using its unique identifier</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Notification ID</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid GUID format</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🎯</span>Get Notification</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🔄</span>Clear
                    </button>
                </div>
            </form>
            {/* Results Section */}
            {hasSearched && notification && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Notification Details</h4>
                        <span className="results-count">ID: {notification.id}</span>
                    </div>
                    <div className="notification-details-card">
                        <div className="notification-header">
                            <h3 className="notification-vessel">Vessel IMO: {notification.vesselIMO}</h3>
                            <span className="notification-id">ID: {notification.id}</span>
                        </div>
                        <div className="notification-info-grid">
                            <div className="info-group">
                                <label>Dock</label>
                                <span>{notification.dockName || notification.dockId || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Date</label>
                                <span>{notification.visitDate ? new Date(notification.visitDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Status</label>
                                <span>{notification.status || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Purpose</label>
                                <span>{notification.purpose || 'N/A'}</span>
                            </div>
                            <div className="info-group full-width">
                                <label>Crew</label>
                                <span>
                                    <div className="field-box field-box-large">
                                        {notification.crew && notification.crew.length > 0 ? (
                                            notification.crew.map((member, idx) => (
                                                <div key={idx} style={{ marginBottom: '0.5em' }}>
                                                    <strong>Name:</strong> {member.name} &nbsp; <strong>ID:</strong> {member.citizenId} &nbsp; <strong>Nationality:</strong> {member.nationality}
                                                </div>
                                            ))
                                        ) : (
                                            <span>No crew data</span>
                                        )}
                                    </div>
                                </span>
                            </div>
                            <div className="info-group full-width">
                                <label>Loading Manifest</label>
                                {notification.loadingManifest && notification.loadingManifest.containers && notification.loadingManifest.containers.length > 0 ? (
                                    <ul className="manifest-list">
                                        <li>Type: {notification.loadingManifest.type}</li>
                                        <li>Containers: {notification.loadingManifest.containers.map(c => c.identifier).join(', ')}</li>
                                    </ul>
                                ) : (
                                    <span>No loading manifest</span>
                                )}
                            </div>
                            <div className="info-group full-width">
                                <label>Unloading Manifest</label>
                                {notification.unloadingManifest && notification.unloadingManifest.containers && notification.unloadingManifest.containers.length > 0 ? (
                                    <ul className="manifest-list">
                                        <li>Type: {notification.unloadingManifest.type}</li>
                                        <li>Containers: {notification.unloadingManifest.containers.map(c => c.identifier).join(', ')}</li>
                                    </ul>
                                ) : (
                                    <span>No unloading manifest</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetVesselVisitNotificationByIdForm component loaded!');
