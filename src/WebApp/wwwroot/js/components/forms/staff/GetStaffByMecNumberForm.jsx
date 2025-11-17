// Get Staff by MEC Number Form Component
console.log('GetStaffByMecNumberForm component loading...');

const GetStaffByMecNumberForm = () => {
    const [searchData, setSearchData] = React.useState({
        mecNumber: ''
    });
    const [staff, setStaff] = React.useState(null);
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
        if (!searchData.mecNumber.trim()) {
            setMessage({ type: 'error', text: "MEC number is required" });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(searchData.mecNumber.trim());
            if (data) {
                setStaff(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: `Found staff member: ${data.mecanographicNumber}` });
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: `Staff member '${searchData.mecNumber}' not found` });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Staff member '${searchData.mecNumber}' not found` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch staff member. Please try again.' });
            }
            setStaff(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ mecNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Staff by MEC Number</h4>
                <p>Retrieve detailed information about a staff member using their unique MEC number</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchMecNumber">MEC Number</label>
                        <input
                            type="text"
                            id="searchMecNumber"
                            name="mecNumber"
                            value={searchData.mecNumber}
                            onChange={handleInputChange}
                            placeholder="Enter MEC number (e.g., 12345)"
                            className="form-input"
                        />
                        <small className="form-help">Must be a valid MEC number</small>
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
                                Get Staff
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
            {hasSearched && staff && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Staff Details</h4>
                        <span className="results-count">MEC Number: {staff.mecanographicNumber}</span>
                    </div>
                    <div className="staff-details-card">
                        <div className="staff-info-grid">
                            <div className="info-group">
                                <label>Name</label>
                                <span>{staff.shortName || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Email</label>
                                <span>{staff.email || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Phone</label>
                                <span>{staff.phone || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Status</label>
                                <span>{staff.status || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Operational Window</label>
                                <span>{staff.operationalWindow || 'N/A'}</span>
                            </div>
                            <div className="info-group">
                                <label>Qualifications</label>
                                <span>{staff.qualifications && staff.qualifications.length > 0 ? staff.qualifications.map(q => q.name).join(', ') : 'None'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('GetStaffByMecNumberForm component loaded!');
