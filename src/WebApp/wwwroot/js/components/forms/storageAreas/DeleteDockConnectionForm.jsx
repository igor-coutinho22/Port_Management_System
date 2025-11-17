// Delete Dock-StorageArea Connection Form Component
console.log('DeleteDockConnectionForm component loading...');

const DeleteDockConnectionForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        storageAreaId: '',
        dockId: ''
    });
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [docks, setDocks] = React.useState([]);
    const [connection, setConnection] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    React.useEffect(() => {
        loadStorageAreas();
        loadDocks();
    }, []);

    const loadStorageAreas = async () => {
        try {
            const data = await apiService.getStorageAreas();
            const mapped = (data || []).map(item => ({
                id: item.storageArea?.id,
                name: item.storageArea?.name
            }));
            setStorageAreas(mapped);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load storage areas.' });
        }
    };

    const loadDocks = async () => {
        try {
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load docks.' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!formData.storageAreaId || !formData.dockId) {
            setMessage({ type: 'error', text: 'Please select both a storage area and a dock.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setConnection(null);
        try {
            // Simulate API call to get connection details
            // Replace with actual API if available
            const data = await apiService.getConnection(formData.storageAreaId, formData.dockId);
            if (data) {
                setConnection({ ...data, storageAreaId: formData.storageAreaId, dockId: formData.dockId });
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Connection found. Please confirm deletion below.' });
            } else {
                setConnection(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Connection not found with the provided IDs.' });
            }
        } catch (error) {
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Connection not found with the provided IDs.' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch connection. Please try again.' });
            }
            setConnection(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (!connection || confirmationText !== 'DELETE') {
            setMessage({ type: 'error', text: 'Please type DELETE to confirm deletion.' });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteConnection(connection.storageAreaId, connection.dockId);
            setMessage({ type: 'success', text: `Connection "${connection.connectionName}" deleted successfully.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete connection. Please try again.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setFormData({ storageAreaId: '', dockId: '' });
        setConnection(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setFormData({ storageAreaId: '', dockId: '' });
        setConnection(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Dock-StorageArea Connection</h4>
                <p>Search for a dock-storage area connection and permanently delete it from the system.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Connection */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="storageAreaId">Storage Area</label>
                            <select
                                id="storageAreaId"
                                name="storageAreaId"
                                value={formData.storageAreaId}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select a storage area</option>
                                {storageAreas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name} (ID: {area.id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="dockId">Dock</label>
                            <select
                                id="dockId"
                                name="dockId"
                                value={formData.dockId}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select a dock</option>
                                {docks.map(dock => (
                                    <option key={dock.id} value={dock.id}>{dock.name} (ID: {dock.id})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Connection</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && connection && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Connection Deletion</span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}><span style={{ marginRight: '4px' }}>🔍</span>Search different connection</button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Connection to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">STORAGE AREA ID:</span><br />{connection.storageAreaId}</div>
                            <div className="delete-details-field"><span className="delete-details-label">DOCK ID:</span><br />{connection.dockId}</div>
                            <div className="delete-details-field"><span className="delete-details-label">DISTANCE (METERS):</span><br />{connection.distanceMeters}</div>
                            <div className="delete-details-field"><span className="delete-details-label">TRAVEL TIME (SECONDS):</span><br />{connection.travelSeconds}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this connection will permanently remove it from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>Type <strong>DELETE</strong> to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder="DELETE"
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== 'DELETE'}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>🗑️ Delete Connection</>)}
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