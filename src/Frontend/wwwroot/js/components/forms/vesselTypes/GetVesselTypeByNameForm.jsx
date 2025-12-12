// Get Vessel Type by Name Form Component
console.log('🎯 GetVesselTypeByNameForm component loading...');

const GetVesselTypeByNameForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: ''
    });
    const [vesselType, setVesselType] = React.useState(null);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate name field
        if (!searchData.name.trim()) {
            setMessage({ type: 'error', text: 'Vessel type name is required' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setVesselType(null);
        
        try {
            const data = await apiService.getVesselTypeByName(searchData.name.trim());
            if (data) {
                setVesselType(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: `Found vessel type: ${data.name}` });
            } else {
                setVesselType(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: `Vessel type '${searchData.name}' not found` });
            }
        } catch (error) {
            console.error('Error fetching vessel type:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Vessel type '${searchData.name}' not found` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch vessel type. Please try again.' });
            }
            setVesselType(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '' });
        setVesselType(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Vessel Type by Name</h4>
                <p>Retrieve detailed information about a specific vessel type by its exact name</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">Vessel Type Name</label>
                        <input
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Container Ship, Bulk Carrier, Tanker"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Enter the exact name of the vessel type you want to find</small>
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
                                Get Vessel Type
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
            {hasSearched && vesselType && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Vessel Type Details</h4>
                        <span className="results-count">Name: {vesselType.name}</span>
                    </div>
                    
                    <div className="vessel-details-card">
                        <div className="vessel-header">
                            <h3 className="vessel-name">{vesselType.name}</h3>
                            <span className="vessel-imo">Type: {vesselType.name}</span>
                        </div>
                        
                        <div className="vessel-info-grid">
                            <div className="info-group">
                                <label>Name</label>
                                <span>{vesselType.name || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Description</label>
                                <span>{vesselType.description || 'No description provided'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Max Bays</label>
                                <span>{vesselType.maxBays || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Max Rows</label>
                                <span>{vesselType.maxRows || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Max Tiers</label>
                                <span>{vesselType.maxTiers || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Max TEU Capacity</label>
                                <span style={{ fontWeight: '600', color: "white" }}>
                                    {vesselType.maxTEUCapacity || 'N/A'}
                                </span>
                            </div>
                            
                            <div className="info-group">
                                <label>Container Dimensions</label>
                                <span>{(vesselType.maxBays || 0)}×{(vesselType.maxRows || 0)}×{(vesselType.maxTiers || 0)}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Capacity Formula</label>
                                <span style={{ fontStyle: 'italic', color: "white" }}>
                                    {vesselType.maxBays} × {vesselType.maxRows} × {vesselType.maxTiers} = {vesselType.maxTEUCapacity} TEU
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetVesselTypeByNameForm component loaded! 🎯');