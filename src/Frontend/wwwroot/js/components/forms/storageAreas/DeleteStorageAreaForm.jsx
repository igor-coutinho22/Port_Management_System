// Delete Storage Area Form Component

const DeleteStorageAreaForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [storageArea, setStorageArea] = React.useState(null);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Storage Area ID is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStorageArea(null);
        try {
            const data = await apiService.getStorageAreaById(searchData.id.trim());
            if (data) {
                setStorageArea({ ...data, id: searchData.id.trim() });
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Storage area found. Please confirm deletion below.' });
            } else {
                setStorageArea(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Storage area not found with the provided ID' });
            }
        } catch (error) {
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Storage area not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch storage area. Please try again.' });
            }
            setStorageArea(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!storageArea || confirmationText !== storageArea.name) {
            setMessage({ type: 'error', text: 'Storage area name does not match. Please type the exact name to confirm deletion.' });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteStorageArea(storageArea.id);
            setMessage({ type: 'success', text: `Storage area "${storageArea.name}" deleted successfully.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete storage area. Please try again.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setStorageArea(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setStorageArea(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Storage Area</h4>
                <p>Search for a storage area by ID and permanently delete it from the system</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Storage Area */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Storage Area ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter storage area ID"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique ID of the storage area you want to delete</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Storage Area</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && storageArea && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Storage Area Deletion</span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}><span style={{ marginRight: '4px' }}>🔍</span>Search different storage area</button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Storage Area to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{storageArea.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">NAME:</span><br />{storageArea.name}</div>
                            <div className="delete-details-field"><span className="delete-details-label">TYPE:</span><br />{storageArea.type}</div>
                            <div className="delete-details-field"><span className="delete-details-label">MAX CAPACITY (TEU):</span><br />{storageArea.maxCapacityTeu}</div>
                            <div className="delete-details-field"><span className="delete-details-label">CURRENT OCCUPANCY (TEU):</span><br />{storageArea.currentOccupancyTeu}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this storage area will permanently remove it from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>Type "<strong>{storageArea.name}</strong>" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={storageArea.name}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== storageArea.name}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>🗑️ Delete Storage Area</>)}
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