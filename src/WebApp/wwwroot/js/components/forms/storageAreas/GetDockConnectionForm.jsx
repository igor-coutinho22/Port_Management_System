// Get Dock-StorageArea Connection Form Component
console.log('GetDockConnectionForm component loading...');

const GetDockConnectionForm = () => {
    const [formData, setFormData] = React.useState({
        storageAreaId: '',
        dockId: ''
    });
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [docks, setDocks] = React.useState([]);
    const [connection, setConnection] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

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
            const data = await apiService.getConnection(formData.storageAreaId, formData.dockId);
            if (data) {
                setConnection({ ...data, storageAreaId: formData.storageAreaId, dockId: formData.dockId });
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Connection found.' });
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

    const handleClear = () => {
        setFormData({ storageAreaId: '', dockId: '' });
        setConnection(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Dock-StorageArea Connection</h4>
                <p>Search for a dock-storage area connection and view its details.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
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
                        <span>🧹</span>Clear
                    </button>
                </div>
            </form>
            {hasSearched && connection && (
                <div className="connection-details" style={{
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
                    <div className="connection-summary" style={{ color: '#ffe066', fontSize: '1.08rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {['storageAreaId', 'dockId', 'distanceMeters', 'travelSeconds'].map((key, idx) => {
                            const labels = {
                                storageAreaId: 'STORAGE AREA ID:',
                                dockId: 'DOCK ID:',
                                distanceMeters: 'DISTANCE (METERS):',
                                travelSeconds: 'TRAVEL TIME (SECONDS):'
                            };
                            // Light/dark mode detection
                            const isLightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
                            const fieldBg = isLightMode ? '#f5f5f5' : '#232323';
                            const labelColor = isLightMode ? '#2d3a4a' : '#6ec6ff';
                            const valueColor = isLightMode ? '#222' : '#fff';
                            return (
                                <div key={key} className="summary-item" style={{ background: fieldBg, borderRadius: '8px', padding: '10px 16px', color: labelColor, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1em', color: labelColor }}>{labels[key]}</span>
                                    <span style={{ color: valueColor, fontWeight: 600, fontSize: '1.15em' }}>{connection[key]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};