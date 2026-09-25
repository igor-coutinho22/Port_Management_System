// Search Vessel Visit Notifications Form Component

const SearchVesselVisitNotificationsForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        vesselIMO: '',
        status: '',
        fromDate: '',
        toDate: '',
        representative: ''
    });
    const vesselVisitStatusOptions = [
        { value: '', label: 'Any Status' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' }
    ];
    const [searchResults, setSearchResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [shippingAgentOrganizations, setShippingAgentOrganizations] = React.useState([]);

    React.useEffect(() => {
		// Fetch all vessels and docks once for name lookup
		async function fetchMeta() {
			const orgs = await apiService.getOrganizations();
			setShippingAgentOrganizations(orgs || []); // And save them to state
		}
		fetchMeta();
	}, []);

    function getOrganizationLegalName(id) {
		const org = shippingAgentOrganizations.find(o => o.id === id);
		return org ? org.legalName || t('vesselVisitNotificationsHubPage.table.notAvailable') : t('vesselVisitNotificationsHubPage.table.notAvailable');
	}

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (notificationId) => {
        try {
            const notification = await apiService.getVesselVisitNotificationById(notificationId);
            let details = `Notification Details:\n\nID: ${notification.id}\nVessel IMO: ${notification.vesselIMO}\nDock: ${notification.dockId || notification.dock || ''}\nDate: ${notification.visitDate ? new Date(notification.visitDate).toLocaleDateString() : ''}\nPurpose: ${notification.purpose}\nStatus: ${notification.status}`;
            // Crew details (always show if present)
            if (notification.crew && Array.isArray(notification.crew) && notification.crew.length > 0) {
                details += `\n\nCrew:`;
                notification.crew.forEach((member, idx) => {
                    details += `\n  ${idx + 1}. Name: ${member.name || ''}, Id: ${member.citizenId || ''}, Nationality: ${member.nationality || ''}`;
                });
            } else if (notification.crew.length === 0) {
                details += `\n\nCrew: None`;
            }
            // Manifests (replicate QuickTable logic)
            if (notification.loadingManifest && notification.loadingManifest.containers && notification.loadingManifest.containers.length > 0) {
                details += `\n\nLoading Manifest:`;
                details += `\n  Type: ${notification.loadingManifest.type || ''}`;
                details += `\n  Containers: ${notification.loadingManifest.containers.map(c => c.identifier).join(', ')}`;
            } else {
                details += `\n\nLoading Manifest: None`;
            }
            if (notification.unloadingManifest && notification.unloadingManifest.containers && notification.unloadingManifest.containers.length > 0) {
                details += `\n\nUnloading Manifest:`;
                details += `\n  Type: ${notification.unloadingManifest.type || ''}`;
                details += `\n  Containers: ${notification.unloadingManifest.containers.map(c => c.identifier).join(', ')}`;
            } else {
                details += `\n\nUnloading Manifest: None`;
            }
            alert(details);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.vesselIMO.trim() && !searchData.status.trim() && !searchData.fromDate.trim() && !searchData.toDate.trim() && !searchData.representative.trim()) {
            setMessage({ type: 'error', text: 'Please provide at least one search criteria' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        try {
            const results = await apiService.searchVesselVisitNotifications(searchData);
            setSearchResults(results);
            setHasSearched(true);
            if (results.length === 0) {
                setMessage({ type: 'info', text: 'No notifications found matching the search criteria' });
            } else {
                const resultText = results.length === 1 ? 'notification found' : 'notifications found';
                setMessage({ type: 'success', text: `Found ${results.length} ${resultText}` });
            }
        } catch (error) {
            console.error('Error searching notifications:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to search notifications. Please try again.' });
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ vesselIMO: '', status: '', fromDate: '', toDate: ''});
        setSearchResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Vessel Visit Notifications</h4>
                <p>Search for vessel visit notifications by vessel IMO, status, date range, or representative</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchVesselIMO">Vessel IMO</label>
                        <input
                            type="text"
                            id="searchVesselIMO"
                            name="vesselIMO"
                            value={searchData.vesselIMO}
                            onChange={handleInputChange}
                            placeholder="Enter vessel IMO"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchStatus">Status</label>
                        <select
                            id="searchStatus"
                            name="status"
                            value={searchData.status}
                            onChange={handleInputChange}
                            className="form-input"
                        >
                            {vesselVisitStatusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchFromDate">From Date</label>
                        <input
                            type="date"
                            id="searchFromDate"
                            name="fromDate"
                            value={searchData.fromDate}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchToDate">To Date</label>
                        <input
                            type="date"
                            id="searchToDate"
                            name="toDate"
                            value={searchData.toDate}
                            onChange={handleInputChange}
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Searching...</>) : (<><span>🔍</span>Search Notifications</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear}>
                        <span>🧹</span>Clear
                    </button>
                </div>
            </form>
            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
                <div className="search-results">
                    <h5>Search Results ({searchResults.length} found)</h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vessel IMO</th>
                                    <th>Dock</th>
                                    <th>Date</th>
                                    <th>Purpose</th>
                                    <th>Status</th>
									<th>Organization</th>
									<th>Arrival Time</th>
									<th>Departure Time</th>
									<th>Loading Time</th>
									<th>Unloading Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((notification) => (
                                    <tr key={notification.id}>
                                        <td>{notification.id}</td>
                                        <td>{notification.vesselIMO}</td>
                                        <td>{notification.dockId || notification.dock || ''}</td>
                                        <td>{notification.visitDate ? new Date(notification.visitDate).toLocaleDateString() : ''}</td>
                                        <td>{notification.purpose}</td>
                                        <td>
										<span className={`status-badge status-${(notification.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
											{notification.status || 'N/A'}
										</span>
									</td>
									<td>{getOrganizationLegalName(notification.shippingAgentOrganizationId)}</td>
									<td>{notification.arrivalTime ? new Date(notification.arrivalTime).toLocaleString() : 'N/A'}</td>
									<td>{notification.desiredDepartureTime ? new Date(notification.desiredDepartureTime).toLocaleString() : 'N/A'}</td>
									<td>{notification.estimatedLoadingDurationMinutes != null ? `${notification.estimatedLoadingDurationMinutes} min` : 'N/A'}</td>
                                    <td>{notification.estimatedUnloadingDurationMinutes != null ? `${notification.estimatedUnloadingDurationMinutes} min` : 'N/A'}</td>
                                        <td>
                                            <button className="btn-small view-btn" onClick={() => handleViewDetails(notification.id)}>
                                                👁️ View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
