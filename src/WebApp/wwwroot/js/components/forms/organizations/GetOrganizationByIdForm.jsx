// Get Organization by ID Form Component
console.log('GetOrganizationByIdForm component loading...');

const GetOrganizationByIdForm = () => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [organization, setOrganization] = React.useState(null);
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
            setMessage({ type: 'error', text: 'Organization ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid organization ID (e.g., 12345678-1234-1234-1234-123456789abc)' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setOrganization(null);
        try {
            const data = await apiService.getOrganizationById(searchData.id.trim());
            if (data) {
                setOrganization(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Organization found successfully' });
            } else {
                setOrganization(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Organization not found' });
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Organization not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch organization. Please try again.' });
            }
            setOrganization(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Organization by ID</h4>
                <p>Retrieve detailed information about a specific organization using its unique identifier</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Organization ID</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="Enter organization ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid GUID format</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Get Organization</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🔄</span>Clear
                    </button>
                </div>
            </form>
            {/* Results Section */}
            {hasSearched && organization && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Organization Details</h4>
                        <span className="results-count">ID: {organization.id}</span>
                    </div>
                    <div className="organization-details-card">
                        <div className="organization-header">
                            <h3 className="organization-name">{organization.legalName}</h3>
                            <span className="organization-id">ID: {organization.id}</span>
                        </div>
                        <div className="organization-info-grid">
                            <div className="info-group">
                                <label>Identifier</label>
                                <span>{organization.identifier || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Alternative Names</label>
                                <span>{organization.alternativeNames || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Address</label>
                                <span>{organization.address || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Tax Number</label>
                                <span>{organization.taxNumber || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Status</label>
                                <span>{organization.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            <div className="info-group full-width">
                                <label>Representatives</label>
                                <div className="representatives-list">
                                    {organization.representatives && organization.representatives.length > 0 ? (
                                        organization.representatives.map((rep, idx) => (
                                            <div key={idx} className="representative-card" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ minWidth: 180, marginRight: 24 }}>
                                                    <strong>{rep.name}</strong> ({rep.citizenId})
                                                </div>
                                                <span style={{ marginRight: 12 }}>{rep.nationality}</span>
                                                <span style={{ marginRight: 12 }}>{rep.email}</span>
                                                <span>{rep.phone}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="no-representatives">No representatives</span>
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

console.log('GetOrganizationByIdForm component loaded!');