// Delete Dock Form Component
console.log('🗑️ DeleteDockForm component loading...');

const DeleteDockForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [dock, setDock] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Dock ID is required' });
            return;
        }
        
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid dock ID' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setDock(null);
        
        try {
            const data = await apiService.getDockById(searchData.id.trim());
            if (data) {
                // Add the ID to the dock data since getDockById doesn't return it
                const dockWithId = { ...data, id: searchData.id.trim() };
                setDock(dockWithId);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Dock found successfully. Please confirm deletion below.' });
            } else {
                setDock(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Dock not found with the provided ID' });
            }
        } catch (error) {
            console.error('Error fetching dock:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Dock not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch dock. Please try again.' });
            }
            setDock(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== dock.name) {
            setMessage({ 
                type: 'error', 
                text: 'Dock name does not match. Please type the exact dock name to confirm deletion.' 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            // Delete dock
            await apiService.deleteDock(dock.id);
            
            setMessage({ 
                type: 'success', 
                text: `Dock "${dock.name}" has been successfully deleted.`
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                // Notify parent component
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting dock:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to delete dock. Please try again.' 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Dock</h4>
                <p>Search for a dock by ID and permanently delete it from the system</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* Step 1: Search for Dock */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Dock ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter dock ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique GUID of the dock you want to delete</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Search Dock
                                </>
                            )}
                        </button>

                        <button 
                            type="button" 
                            className="clear-btn"
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            <span>🧹</span>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && dock && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Dock Deletion</span>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>Search different dock
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Dock to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{dock.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Name:</span><br />{dock.name}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Location:</span><br />{dock.location}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Dimensions:</span><br />{dock.lengthMeters}m × {dock.depthMeters}m × {dock.maxDraftMeters}m</div>
                            <div className="delete-details-field"><span className="delete-details-label">Allowed Vessel Types:</span><br />{dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 ? dock.allowedVesselTypes.join(', ') : 'None'}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this dock will permanently remove it from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>Type "<strong>{dock.name}</strong>" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={dock.name}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== dock.name}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span>Deleting...</>
                                    ) : (
                                        <>🗑️ Delete Dock</>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span role="img" aria-label="cancel">🧹</span>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

console.log('DeleteDockForm component loaded! 🗑️');