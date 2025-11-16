// Delete Storage Area Form Component
console.log('DeleteStorageAreaForm component loading...');

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
                    <div className="form-section-header">
                        <h5>⚠️ Confirm Storage Area Deletion</h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>🔍 Search different storage area</button>
                    </div>
                    {/* Storage Area Details */}
                    <div className="delete-storagearea-info" style={{
                        background: 'none',
                        border: '2px solid #ffe066',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        margin: '18px 0',
                        boxShadow: '0 2px 12px 0 rgba(255,224,102,0.08)',
                        color: '#ffe066',
                        maxWidth: '540px',
                        fontWeight: 500
                    }}>
                        <div className="storagearea-summary" style={{ color: '#ffe066', fontSize: '1.08rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['id', 'name', 'type', 'maxCapacityTeu', 'currentOccupancyTeu'].map((key, idx) => {
                                const labels = {
                                    id: 'ID:',
                                    name: 'NAME:',
                                    type: 'TYPE:',
                                    maxCapacityTeu: 'MAX CAPACITY (TEU):',
                                    currentOccupancyTeu: 'CURRENT OCCUPANCY (TEU):'
                                };
                                // Light/dark mode detection
                                const isLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
                                const fieldBg = isLightMode ? '#f5f5f5' : '#232323';
                                const labelColor = isLightMode ? '#2d3a4a' : '#6ec6ff';
                                const valueColor = isLightMode ? '#222' : '#fff';
                                return (
                                    <div key={key} className="summary-item" style={{ background: fieldBg, borderRadius: '8px', padding: '10px 16px', color: labelColor, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '1em', color: labelColor }}>{labels[key]}</span>
                                        <span style={{ color: valueColor, fontWeight: 600, fontSize: '1.15em' }}>{storageArea[key]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Confirmation Form */}
                    <form onSubmit={handleDelete} className="delete-form">
                        <div className="danger-zone">
                            <div className="danger-header">
                                <h6>⚠️ Warning: This action cannot be undone</h6>
                                <p>Deleting this storage area will permanently remove it from the system. All associated data will be lost.</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmationText">Type "<strong>{storageArea.name}</strong>" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={storageArea.name}
                                    className="form-input danger-input"
                                    required
                                />
                                <small className="form-help danger-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== storageArea.name} style={{ background: '#e74c3c', color: '#fff' }}>
                                {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<><span>🗑️</span>Delete Storage Area</>)}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isDeleting}>
                                <span>🧹</span>Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};