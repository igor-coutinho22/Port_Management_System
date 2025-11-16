// Search Staff Form Component
console.log('SearchStaffForm component loading...');

const SearchStaffForm = () => {
    const [searchData, setSearchData] = React.useState({
        name: '',
        status: '',
        qualification: ''
    });
    const [results, setResults] = React.useState([]);
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
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResults([]);
        try {
            const data = await apiService.searchStaff(
                searchData.name.trim(),
                searchData.status.trim(),
                searchData.qualification.trim()
            );
            setResults(data);
            setHasSearched(true);
            setMessage({ type: 'success', text: `${data.length} staff found` });
        } catch (error) {
            console.error('Error searching staff:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to search staff. Please try again.' });
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', status: '', qualification: '' });
        setResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Staff</h4>
                <p>Find staff members by name, status, or qualification</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">Name</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder="Enter staff name"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchStatus">Status</label>
                        <select
                            id="searchStatus"
                            name="status"
                            value={searchData.status}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">Any</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchQualification">Qualification Code</label>
                        <input
                            type="text"
                            id="searchQualification"
                            name="qualification"
                            value={searchData.qualification}
                            onChange={handleInputChange}
                            placeholder="Enter qualification code (e.g., Q-001)"
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
                                Loading...
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                Search Staff
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
            {hasSearched && results.length > 0 && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Staff Results</h4>
                        <span className="results-count">{results.length} found</span>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>MEC Number</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Operational Window</th>
                                    <th>Qualifications</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((staff) => (
                                    <tr key={staff.mecanographicNumber}>
                                        <td>{staff.mecanographicNumber}</td>
                                        <td>{staff.shortName}</td>
                                        <td>{staff.email}</td>
                                        <td>{staff.phone}</td>
                                        <td>{staff.status}</td>
                                        <td>{staff.operationalWindow}</td>
                                        <td>{staff.qualifications && staff.qualifications.length > 0 ? staff.qualifications.map(q => q.name).join(', ') : 'None'}</td>
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

console.log('SearchStaffForm component loaded!');
