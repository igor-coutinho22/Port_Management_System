const GetCategoryByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter a Category ID.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        setData(null);

        try {
            const result = await apiService.getCategoryById(searchId.trim());
            if (result) {
                setData(result);
                setMessage({ type: 'success', text: 'Category found.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Category not found.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Details</h4>
                <p>Inspect raw category record by System ID.</p>
            </div>
            
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label>Category ID</label>
                    <input 
                        type="text"
                        value={searchId} 
                        onChange={(e) => setSearchId(e.target.value)} 
                        className="form-input" 
                        placeholder="e.g. 64b..." 
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
                                <td className="monospace-input" style={{ fontSize: '1.1em' }}>
                                    {data.code}
                                </td>
                            </tr>
                            <tr>
                                <th>Name</th>
                                <td>{data.name}</td>
                            </tr>
                            <tr>
                                <th>Expected Impact</th>
                                <td>
                                    <span 
                                        className="status-badge" 
                                        style={{
                                            backgroundColor: data.expectedImpact === 'Suspension' ? '#dc3545' : '#28a745',
                                            color: 'white'
                                        }}
                                    >
                                        {data.expectedImpact}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Default Duration</th>
                                <td>{data.defaultDuration > 0 ? `${data.defaultDuration} min` : '-'}</td>
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