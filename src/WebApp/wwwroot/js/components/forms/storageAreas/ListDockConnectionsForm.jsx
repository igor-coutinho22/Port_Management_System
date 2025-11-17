// List Dock-StorageArea Connections Form Component
console.log('ListDockConnectionsForm component loading...');

const ListDockConnectionsForm = () => {
    const [storageAreaId, setStorageAreaId] = React.useState('');
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [connections, setConnections] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [hasSearched, setHasSearched] = React.useState(false);

    React.useEffect(() => {
        loadStorageAreas();
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

    const handleStorageAreaChange = (e) => {
        setStorageAreaId(e.target.value);
        setMessage({ type: '', text: '' });
        setConnections([]);
        setHasSearched(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!storageAreaId) {
            setMessage({ type: 'error', text: 'Please select a storage area.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setConnections([]);
        setHasSearched(false);
        try {
            const data = await apiService.getConnections(storageAreaId);
            setConnections(data || []);
            setHasSearched(true);
            if (!data || data.length === 0) {
                setMessage({ type: 'info', text: 'No connections found for this storage area.' });
            } else {
                setMessage({ type: 'success', text: `Found ${data.length} connection(s).` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to fetch connections.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setStorageAreaId('');
        setConnections([]);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>List Dock-StorageArea Connections</h4>
                <p>View all connections for a selected storage area.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label htmlFor="storageAreaId">Storage Area</label>
                    <select
                        id="storageAreaId"
                        name="storageAreaId"
                        value={storageAreaId}
                        onChange={handleStorageAreaChange}
                        className="form-input"
                        required
                    >
                        <option value="">Select a storage area</option>
                        {storageAreas.map(area => (
                            <option key={area.id} value={area.id}>{area.name} (ID: {area.id})</option>
                        ))}
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>List Connections</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🧹</span>Clear
                    </button>
                </div>
            </form>
            {hasSearched && connections.length > 0 && (
                <div className="connections-table-container" style={{ marginTop: '24px' }}>
                    <table className="connections-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'none', color: '#fff' }}>
                        <thead>
                            <tr style={{ background: '#232323', color: '#ffe066' }}>
                                <th style={{ padding: '10px', borderBottom: '2px solid #ffe066' }}>Dock ID</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #ffe066' }}>Distance (m)</th>
                                <th style={{ padding: '10px', borderBottom: '2px solid #ffe066' }}>Travel Time (s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.map((conn, idx) => (
                                <tr key={idx} style={{ background: idx % 2 === 0 ? '#2d3a4a' : '#232323' }}>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>{conn.dockId}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>{conn.distanceMeters}</td>
                                    <td style={{ padding: '10px', borderBottom: '1px solid #444' }}>{conn.travelSeconds}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};