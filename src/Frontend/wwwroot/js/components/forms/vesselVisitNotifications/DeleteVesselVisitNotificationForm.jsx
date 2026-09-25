// Delete Vessel Visit Notification Form Component

const DeleteVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [notification, setNotification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
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
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid notification ID' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setNotification(null);
        try {
            const data = await apiService.getVesselVisitNotificationById(searchData.id.trim());
            if (data) {
                const notificationWithId = { ...data, id: searchData.id.trim() };
                setNotification(notificationWithId);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Notification found successfully. Please confirm deletion below.' });
            } else {
                setNotification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Notification not found with the provided ID' });
            }
        } catch (error) {
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

    const handleDelete = async (e) => {
        e.preventDefault();
        if (confirmationText !== notification.id) {
            setMessage({ type: 'error', text: 'Notification ID does not match. Please type the exact notification ID to confirm deletion.' });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteVesselVisitNotification(notification.id);
            setMessage({ type: 'success', text: `Notification "${notification.id}" has been successfully deleted.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete notification. Please try again.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setNotification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setNotification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Vessel Visit Notification</h4>
                <p>Search for a notification by ID and permanently delete it from the system</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Notification */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Notification ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique GUID of the notification you want to delete</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Notification</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && notification && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Notification Deletion</span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span style={{ marginRight: '4px' }}>🔍</span>Search different notification
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Notification to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{notification.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Vessel IMO:</span><br />{notification.vesselIMO}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Dock:</span><br />{notification.dockId}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Date:</span><br />{notification.visitDate ? new Date(notification.visitDate).toLocaleDateString() : 'N/A'}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Status:</span><br />{notification.status}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this notification will permanently remove it from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>Type "<strong>{notification.id}</strong>" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={notification.id}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== notification.id}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>🗑️ Delete Notification</>)}
                                </button>
                                <button type="button" className="delete-cancel-btn" onClick={handleClear} disabled={isDeleting}>
                                    <span role="img" aria-label="cancel">🧹</span>Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};
