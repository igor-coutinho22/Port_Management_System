// Get Representative by ID Form Component
console.log('GetRepresentativeByIdForm is loading...');

const GetRepresentativeByIdForm = () => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [representative, setRepresentative] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Representative ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid representative ID (e.g., 12345678-1234-1234-1234-123456789abc)' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setRepresentative(null);
        try {
            const data = await apiService.getRepresentativeById(searchData.id.trim());
            if (data) {
                setRepresentative(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Representative found successfully' });
            } else {
                setRepresentative(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Representative not found' });
            }
        } catch (error) {
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Representative not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch representative. Please try again.' });
            }
            setRepresentative(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setRepresentative(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Representative by ID</h4>
                <p>Retrieve detailed information about a specific representative using its unique identifier</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Representative ID</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="Enter representative ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid GUID format</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🎯</span>Get Representative</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🔄</span>Clear
                    </button>
                </div>
            </form>
            {/* Results Section */}
            {hasSearched && representative && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Representative Details</h4>
                        <span className="results-count">ID: {representative.id}</span>
                    </div>
                    <div className="representative-details-card">
                        <div className="rep-header">
                            <h3 className="rep-name">{representative.name}</h3>
                            <span className="rep-id">ID: {representative.id}</span>
                        </div>
                        <div className="rep-info-grid">
                            <div className="info-group">
                                <label>Citizen ID</label>
                                <span>{representative.citizenId || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Nationality</label>
                                <span>{representative.nationality || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Email</label>
                                <span>{representative.email || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Phone</label>
                                <span>{representative.phone || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Status</label>
                                <span>{representative.isActive === true ? 'Active' : representative.isActive === false ? 'Inactive' : 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Organization</label>
                                <span>{representative.organizationId || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetRepresentativeByIdForm component loaded!');