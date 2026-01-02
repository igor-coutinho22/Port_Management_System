const GetIncidentTypeByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setData(null);

        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter an ID.' });
            setLoading(false);
            return;
        }

        try {
            const result = await apiService.getIncidentTypeById(searchId.trim());
            
            if (result) {
                setData(result);
                setMessage({ type: 'success', text: 'Found.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            
            // Use Controller Message
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Error fetching data.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Type Details</h4>
                <p>View full definition of a specific incident type.</p>
            </div>

            {/* MOVED MESSAGE ABOVE THE FORM */}
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label>ID</label>
                    <input 
                        type="text" 
                        value={searchId} 
                        onChange={(e) => setSearchId(e.target.value)} 
                        placeholder="e.g., 64b..."
                        className="form-input"
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Searching...' : '🔍 Search'}
                </button>
            </form>

            {data && (
                <div className="result-container fade-in">
                    <table className="detailed-table">
                        <tbody>
                            <tr>
                                <th>Code</th>
                                <td className="monospace-input" style={{fontSize: '1.1em'}}>
                                    {data.code}
                                </td>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <td>{data.name}</td>
                            </tr>
                            <tr>
                                <th>Severity</th>
                                <td>
                                    <span className={`status-badge status-${(data.severity || 'minor').toLowerCase()}`}>
                                        {data.severity}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td>{data.description || '-'}</td>
                            </tr>
                            <tr>
                                <th>System ID</th>
                                <td className="monospace-cell">{data.id}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};