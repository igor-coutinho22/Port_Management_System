// Get Dock by ID Form Component
console.log('🎯 GetDockByIdForm component loading...');

// Helper to get color for message type
function getMessageColor(type) {
    switch (type) {
        case 'success': return 'green';
        case 'error': return 'red';
        case 'info': return 'blue';
        default: return 'inherit';
    }
}

const GetDockByIdForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [dock, setDock] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
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
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid dock ID (e.g., 12345678-1234-1234-1234-123456789abc)' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setDock(null);
        
        try {
            const data = await apiService.getDockById(searchData.id.trim());
            if (data) {
                setDock(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Dock found successfully' });
            } else {
                setDock(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Dock not found' });
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

    const handleClear = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Dock by ID</h4>
                <p>Retrieve detailed information about a specific dock using its unique identifier</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type) }}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Dock ID</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="Enter dock ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid GUID format</small>
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
                                <span>🎯</span>
                                Get Dock
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🔄</span>
                        Clear
                    </button>
                </div>
            </form>

            {/* Results Section */}
            {hasSearched && dock && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Dock Details</h4>
                        <span className="results-count">ID: {dock.id}</span>
                    </div>
                    
                    <div className="dock-details-card">
                        <div className="dock-header">
                            <h3 className="dock-name">{dock.name}</h3>
                            <span className="dock-id">ID: {dock.id}</span>
                        </div>
                        
                        <div className="dock-info-grid">
                            <div className="info-group">
                                <label>Location</label>
                                <span>{dock.location || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Length</label>
                                <span>{dock.lengthMeters ? `${dock.lengthMeters}m` : 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Depth</label>
                                <span>{dock.depthMeters ? `${dock.depthMeters}m` : 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Max Draft</label>
                                <span>{dock.maxDraftMeters ? `${dock.maxDraftMeters}m` : 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Dimensions</label>
                                <span>{dock.lengthMeters || 0}m × {dock.depthMeters || 0}m × {dock.maxDraftMeters || 0}m</span>
                            </div>
                            
                            <div className="info-group full-width">
                                <label>Allowed Vessel Types</label>
                                <div className="vessel-types-list">
                                    {dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 ? (
                                        dock.allowedVesselTypes.map((vesselType, index) => (
                                            <span key={index} className="vessel-type-tag">
                                                {vesselType}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="no-vessel-types">No allowed vessel types</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetDockByIdForm component loaded! 🎯');