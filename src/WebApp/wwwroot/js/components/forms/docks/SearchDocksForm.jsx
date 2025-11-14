// Search Docks Form Component
console.log('🔍 SearchDocksForm component loading...');

const SearchDocksForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: '',
        location: '',
        vesselTypeName: ''
    });
    const [searchResults, setSearchResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (dockId) => {
        try {
            const dock = await apiService.getDockById(dockId);
            const vesselTypesText = dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 
                ? dock.allowedVesselTypes.join(', ') 
                : 'None';
            
            alert(`Dock Details:\n\nID: ${dock.id}\nName: ${dock.name}\nLocation: ${dock.location}\nLength: ${dock.lengthMeters}m\nDepth: ${dock.depthMeters}m\nMax Draft: ${dock.maxDraftMeters}m\nAllowed Vessel Types: ${vesselTypesText}`);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate at least one field is filled
        if (!searchData.name.trim() && !searchData.location.trim() && !searchData.vesselTypeName.trim()) {
            setMessage({ type: 'error', text: 'Please provide at least one search criteria (name, location, or vessel type)' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);

        try {
            const results = await apiService.searchDocks(
                searchData.name.trim() || null,
                searchData.location.trim() || null,
                searchData.vesselTypeName.trim() || null
            );
            
            setSearchResults(results);
            setHasSearched(true);
            
            if (results.length === 0) {
                setMessage({ type: 'info', text: 'No docks found matching the search criteria' });
            } else {
                const resultText = results.length === 1 ? 'dock found' : 'docks found';
                setMessage({ type: 'success', text: `Found ${results.length} ${resultText}` });
            }

        } catch (error) {
            console.error('Error searching docks:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to search docks. Please try again.' 
            });
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', location: '', vesselTypeName: '' });
        setSearchResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Docks</h4>
                <p>Search for docks by name, location, and/or vessel type name</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">Dock Name</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder="Enter dock name (partial match)"
                            className="form-input"
                        />
                        <small className="form-help">Partial matches supported</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchLocation">Location</label>
                        <input
                            type="text"
                            id="searchLocation"
                            name="location"
                            value={searchData.location}
                            onChange={handleInputChange}
                            placeholder="Enter location (partial match)"
                            className="form-input"
                        />
                        <small className="form-help">Partial matches supported</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchVesselType">Vessel Type Name</label>
                        <input
                            type="text"
                            id="searchVesselType"
                            name="vesselTypeName"
                            value={searchData.vesselTypeName}
                            onChange={handleInputChange}
                            placeholder="Enter vessel type name (partial match)"
                            className="form-input"
                        />
                        <small className="form-help">Search for docks that allow this vessel type</small>
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
                                <span>🔍</span>
                                Search Docks
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

            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
                <div className="search-results">
                    <h5>Search Results ({searchResults.length} found)</h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Dimensions (L×D×MD)</th>
                                    <th>Allowed Vessel Types</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((dock) => (
                                    <tr key={dock.id}>
                                        <td>{dock.id}</td>
                                        <td>{dock.name}</td>
                                        <td>{dock.location}</td>
                                        <td>
                                            {dock.lengthMeters}m × {dock.depthMeters}m × {dock.maxDraftMeters}m
                                        </td>
                                        <td>
                                            {dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 
                                                ? dock.allowedVesselTypes.join(', ') 
                                                : 'None'}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(dock.id)}
                                            >
                                                👁️ View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('SearchDocksForm component loaded! 🔍');