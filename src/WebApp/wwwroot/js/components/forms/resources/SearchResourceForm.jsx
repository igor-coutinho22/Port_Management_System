// Search Resource Form Component
console.log('🔍 SearchResourceForm component loading...');

const SearchResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: '',
        description: '',
        type: '',
        status: ''
    });
    const [results, setResults] = React.useState([]);
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

    // Resource type options for search
    const resourceTypes = [
        { value: 'STSCrane', label: 'STS Crane' },
        { value: 'YardCrane', label: 'Yard Crane' },
        { value: 'Truck', label: 'Truck' },
        { value: 'Tractor', label: 'Tractor' }
    ];

    // Status options for search
    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'UnderMaintenance', label: 'Under Maintenance' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if at least one search criterion is provided
        if (!searchData.id.trim() && !searchData.description.trim() && 
            !searchData.type && !searchData.status) {
            setMessage({ type: 'error', text: 'Please enter at least one search criterion' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (searchData.id.trim()) params.append('id', searchData.id.trim());
            if (searchData.description.trim()) params.append('description', searchData.description.trim());
            if (searchData.type) params.append('type', searchData.type);
            if (searchData.status) params.append('status', searchData.status);

            // Call API with search parameters
            const response = await apiService.getResources(params.toString());
            
            setResults(response || []);
            setHasSearched(true);
            
            if (response && response.length > 0) {
                setMessage({ 
                    type: 'success', 
                    text: `Found ${response.length} resource${response.length === 1 ? '' : 's'}` 
                });
            } else {
                setMessage({ 
                    type: 'info', 
                    text: 'No resources found with the provided criteria' 
                });
            }

        } catch (error) {
            console.error('Error searching resources:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to search resources' 
            });
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({
            id: '',
            description: '',
            type: '',
            status: ''
        });
        setResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualifications properly
            let qualifications = 'None';
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q)
                    .join(', ');
            }
            
            alert(`Resource Details:\n\nID: ${resource.id || 'N/A'}\nDescription: ${resource.description || 'N/A'}\nType: ${resource.resourceType || 'N/A'}\nStatus: ${resource.status || 'N/A'}\nCapacity: ${resource.operationalCapacity || 'N/A'}\nSetup Time: ${resource.setupTime || 'N/A'} minutes\nQualifications: ${qualifications}`);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Resources</h4>
                <p>Find resources by ID, description, type, or status</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="resource-search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Resource ID</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="e.g., CRANE001, TRUCK005..."
                            className="form-input"
                        />
                        <small className="form-help">Exact ID search</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchDescription">Description</label>
                        <input
                            type="text"
                            id="searchDescription"
                            name="description"
                            value={searchData.description}
                            onChange={handleInputChange}
                            placeholder="e.g., mobile, heavy duty..."
                            className="form-input"
                        />
                        <small className="form-help">Partial matches supported</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchType">Resource Type</label>
                        <select
                            id="searchType"
                            name="type"
                            value={searchData.type}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">All Types</option>
                            {resourceTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
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
                            <option value="">All Statuses</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
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
                                Search Resources
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="clear-btn"
                    >
                        Clear Search
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {hasSearched && results.length > 0 && (
                <div className="search-results">
                    <h5>Search Results ({results.length} {results.length === 1 ? 'resource' : 'resources'} found)</h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Capacity</th>
                                    <th>Setup Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((resource) => (
                                    <tr key={resource.id}>
                                        <td>{resource.id}</td>
                                        <td>{resource.description || 'N/A'}</td>
                                        <td>{resource.resourceType}</td>
                                        <td>
                                            <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {resource.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{resource.operationalCapacity}</td>
                                        <td>{resource.setupTime} min</td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(resource.id)}
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

            {/* No Results Message */}
            {hasSearched && results.length === 0 && (
                <div className="search-results">
                    <h5>Search Results</h5>
                    <div className="empty-results">
                        <p>No resources found matching your criteria.</p>
                        <p>Try adjusting your search parameters and search again.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('SearchResourceForm component loaded! 🔍');