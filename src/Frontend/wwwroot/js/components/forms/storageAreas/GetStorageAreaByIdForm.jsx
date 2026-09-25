// Get Storage Area By ID Form Component

const GetStorageAreaByIdForm = () => {
    const { t } = useTranslation();
    const [storageAreaId, setStorageAreaId] = React.useState('');
    const [result, setResult] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setStorageAreaId(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!storageAreaId.trim()) {
            setMessage({ type: 'error', text: 'Please enter a storage area ID.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setResult(null);
        try {
            const area = await apiService.getStorageAreaById(storageAreaId.trim());
            if (!area) {
                setMessage({ type: 'info', text: `Storage area with ID '${storageAreaId.trim()}' not found.` });
            } else {
                // Normalize result to match expected table structure
                setResult({
                    storageArea: {
                        id: area.id,
                        name: area.name,
                        type: area.type,
                        maxCapacityTeu: area.maxCapacityTeu,
                        currentOccupancyTeu: area.currentOccupancyTeu,
                        dockConnections: area.dockConnections || [],
                    },
                    specializedCargoType: area.specializedCargoType || '',
                    dockIds: area.docksServed || [],
                });
                setMessage({ type: 'success', text: 'Storage area found.' });
            }
        } catch (error) {
            console.error('Error fetching vessel:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Storage area with ID '${storageAreaId.trim()}' not found.` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to get storage area. Please try again.' });
            }
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setStorageAreaId('');
        setResult(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Storage Area by ID</h4>
                <p>Retrieve detailed information about a specific storage area by its ID</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="storageAreaId">Storage Area ID</label>
                        <input
                            type="text"
                            id="storageAreaId"
                            name="storageAreaId"
                            value={storageAreaId}
                            onChange={handleInputChange}
                            placeholder="Enter storage area ID"
                            className="form-input"
                        />
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
                                Searching...
                            </>
                        ) : (
                            <>
                                <span>🎯</span>
                                Get Storage Area
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                    >
                        <span>🧹</span>
                        Clear
                    </button>
                </div>
            </form>

            {/* Result */}
            {result && (
                <div className="search-results">
                    <h5>Result</h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Max Capacity (TEU)</th>
                                    <th>Current Occupancy (TEU)</th>
                                    <th>Specialized Info</th>
                                    <th>Dock Connections</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const sa = result.storageArea || result;
                                    let specializedInfo = 'N/A';
                                    if (sa.type === 'Warehouse' || sa.type === 'warehouse') {
                                        specializedInfo = result.specializedCargoType || 'General';
                                    } else if (sa.type === 'ContainerYard' || sa.type === 'containerYard') {
                                        const dockIds = result.dockIds || sa.dockIds || (sa.dockConnections ? sa.dockConnections.map(dc => dc.dockId) : []);
                                        specializedInfo = dockIds && dockIds.length > 0
                                            ? dockIds.map((id, idx) => (
                                                <span key={id}>
                                                    {id}
                                                    {idx < dockIds.length - 1 && <><br /><br /></>}
                                                </span>
                                            ))
                                            : 'No docks served';
                                    }
                                    return (
                                        <tr key={sa.id}>
                                            <td>{sa.id}</td>
                                            <td>{sa.name}</td>
                                            <td>{sa.type}</td>
                                            <td>{sa.maxCapacityTeu}</td>
                                            <td>{sa.currentOccupancyTeu}</td>
                                            <td>{specializedInfo}</td>
                                            <td>
                                                {sa.dockConnections && sa.dockConnections.length > 0
                                                    ? sa.dockConnections.map((dc, idx) => (
                                                        <span key={dc.dockId}>
                                                            {`${dc.dockId} (Dist: ${dc.distanceMeters}m, Time: ${dc.travelSeconds}sec)`}
                                                            {idx < sa.dockConnections.length - 1 && <><br /><br /></>}
                                                        </span>
                                                    ))
                                                    : 'None'}
                                            </td>
                                        </tr>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
