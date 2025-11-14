// Search Vessel Types Form Component
console.log('🔍 SearchVesselTypesForm component loading...');

const SearchVesselTypesForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: '',
        description: ''
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

    const handleViewDetails = async (vesselTypeName) => {
        try {
            const vesselType = await apiService.getVesselTypeByName(vesselTypeName);
            alert(`Vessel Type Details:\n\nName: ${vesselType.name}\nDescription: ${vesselType.description || 'No description'}\nMax Bays: ${vesselType.maxBays}\nMax Rows: ${vesselType.maxRows}\nMax Tiers: ${vesselType.maxTiers}\nMax TEU Capacity: ${vesselType.maxTEUCapacity}\nDimensions: ${vesselType.maxBays}×${vesselType.maxRows}×${vesselType.maxTiers}`);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate at least one field is filled
        if (!searchData.name.trim() && !searchData.description.trim()) {
            setMessage({ type: 'error', text: 'At least one search parameter (name or description) must be provided.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);

        try {
            const results = await apiService.searchVesselTypes(
                searchData.name.trim() || null,
                searchData.description.trim() || null
            );
            
            setSearchResults(results);
            setHasSearched(true);
            
            if (results.length === 0) {
                setMessage({ type: 'info', text: 'No vessel types found matching the search criteria.' });
            } else {
                const resultText = results.length === 1 ? 'vessel type' : 'vessel types';
                setMessage({ type: 'success', text: `Found ${results.length} ${resultText}` });
            }

        } catch (error) {
            console.error('Error searching vessel types:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to search vessel types. Please try again.' 
            });
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', description: '' });
        setSearchResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Vessel Types</h4>
                <p>Search for vessel types by name or description using partial matches</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">Vessel Type Name</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Container, Cargo, Bulk"
                            className="form-input"
                        />
                        <small className="form-help">Search by vessel type name (partial matches supported)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchDescription">Description</label>
                        <input
                            type="text"
                            id="searchDescription"
                            name="description"
                            value={searchData.description}
                            onChange={handleInputChange}
                            placeholder="e.g., shipping, international, large"
                            className="form-input"
                        />
                        <small className="form-help">Search by description content (partial matches supported)</small>
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
                                Search Vessel Types
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
                        Clear Search
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
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Max Bays</th>
                                    <th>Max Rows</th>
                                    <th>Max Tiers</th>
                                    <th>Max TEU Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((vesselType) => (
                                    <tr key={vesselType.name}>
                                        <td className="name-cell" style={{ fontWeight: '600', color: 'var(--text-accent)' }}>
                                            {vesselType.name}
                                        </td>
                                        <td className="description-cell" style={{ 
                                            maxWidth: '200px', 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap' 
                                        }}>
                                            {vesselType.description || 'No description'}
                                        </td>
                                        <td>{vesselType.maxBays}</td>
                                        <td>{vesselType.maxRows}</td>
                                        <td>{vesselType.maxTiers}</td>
                                        <td style={{ fontWeight: '600' }}>
                                            {vesselType.maxTEUCapacity}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(vesselType.name)}
                                                style={{
                                                    background: 'var(--text-accent)',
                                                    color: 'white',
                                                    padding: '0.4rem 0.8rem',
                                                    fontSize: '0.8rem',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                👁️ View Details
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

console.log('SearchVesselTypesForm component loaded! 🔍');