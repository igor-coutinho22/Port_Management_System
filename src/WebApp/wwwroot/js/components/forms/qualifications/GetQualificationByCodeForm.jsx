// Get Qualification by Code Form Component
console.log('GetQualificationByCodeForm component loading...');

const GetQualificationByCodeForm = () => {
    const [searchData, setSearchData] = React.useState({
        code: ''
    });
    const [qualification, setQualification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.code.trim()) {
            setMessage({ type: 'error', text: "Qualification code is required" });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        try {
            const data = await apiService.getQualificationByCode(searchData.code.trim());
            if (data) {
                setQualification(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: `Found qualification: ${data.code}` });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: `Qualification '${searchData.code}' not found` });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Qualification '${searchData.code}' not found` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch qualification. Please try again.' });
            }
            setQualification(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Qualification by Code</h4>
                <p>Retrieve detailed information about a specific qualification using its unique code</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchCode">Qualification Code</label>
                        <input
                            type="text"
                            id="searchCode"
                            name="code"
                            value={searchData.code}
                            onChange={handleInputChange}
                            placeholder="Enter qualification code (e.g., Q-001)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid code</small>
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
                                Get Qualification
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
            {hasSearched && qualification && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Qualification Details</h4>
                        <span className="results-count">Code: {qualification.code}</span>
                    </div>
                    <div className="qualification-details-card">
                        <div className="qualification-info-grid">
                            <div className="info-group">
                                <label>Name</label>
                                <span>{qualification.name || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label style={{ marginTop: '16px', display: 'inline-block' }}>Code</label>
                                <span>{qualification.code || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetQualificationByCodeForm component loaded!');
