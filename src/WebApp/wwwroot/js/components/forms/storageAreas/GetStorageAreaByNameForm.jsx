// Get Storage Area By Name Form Component
console.log('🔎 GetStorageAreaByNameForm component loading...');

const GetStorageAreaByNameForm = () => {
    const { t } = useTranslation();
    const [storageAreaName, setStorageAreaName] = React.useState('');
    const [result, setResult] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setStorageAreaName(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!storageAreaName.trim()) {
            setMessage({ type: 'error', text: 'Please enter a storage area name.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setResult(null);
        try {
            const area = await apiService.getStorageAreaByName(storageAreaName.trim());
            if (!area) {
                setMessage({ type: 'info', text: 'No storage area found with that name.' });
            } else {
                setResult(area);
                setMessage({ type: 'success', text: 'Storage area found.' });
            }
        } catch (error) {
           console.error('Error fetching vessel:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Storage area with name '${storageAreaName.trim()}' not found.` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to get storage area. Please try again.' });
            }
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setStorageAreaName('');
        setResult(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Storage Area by Name</h4>
                <p>Retrieve detailed information about a specific storage area by its name</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="storageAreaName">Storage Area Name</label>
                        <input
                            type="text"
                            id="storageAreaName"
                            name="storageAreaName"
                            value={storageAreaName}
                            onChange={handleInputChange}
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
                                <span>🔎</span>
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

console.log('GetStorageAreaByNameForm component loaded! 🔎');
