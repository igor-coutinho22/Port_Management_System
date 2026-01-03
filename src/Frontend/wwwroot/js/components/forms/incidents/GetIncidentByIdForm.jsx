const GetIncidentByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HELPER: Format Date ---
    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' });
    };

    // --- HANDLER ---
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setData(null);

        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter an Incident ID.' });
            setLoading(false);
            return;
        }

        try {
            const result = await apiService.getIncidentById(searchId.trim());
            
            if (result) {
                setData(result);
                setMessage({ type: 'success', text: 'Incident found.' });
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
                <h4>Get Incident Details</h4>
                <p>View full details of a specific operational incident.</p>
            </div>

            {/* MESSAGE ABOVE FORM */}
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label>Incident ID</label>
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
                                <th>Status</th>
                                <td>
                                    <span 
                                        className="status-badge" 
                                        style={{ backgroundColor: data.status === 'Resolved' ? '#28a745' : '#dc3545' }}
                                    >
                                        {data.status}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th>Type</th>
                                <td>
                                    <strong>{data.type ? data.type.name : 'Unknown'}</strong>
                                    <br/>
                                    <span className="monospace-input" style={{ fontSize: '0.9em', color: '#666' }}>
                                        {data.type ? data.type.code : ''}
                                    </span>
                                </td>
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
                                <th>Affected Vessel</th>
                                <td>
                                    {data.affectedVessels && data.affectedVessels.length > 0 ? (
                                        data.affectedVessels.map((v, idx) => (
                                            <div key={idx}>🚢 {v.name} (IMO: {v.imo})</div>
                                        ))
                                    ) : (
                                        <span style={{color: '#999'}}>Global Port Issue</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <th>Timeframe</th>
                                <td>
                                    <div><strong>Start:</strong> {formatDate(data.startTime)}</div>
                                    <div style={{ color: data.endTime ? '#28a745' : '#666' }}>
                                        <strong>End:</strong> {data.endTime ? formatDate(data.endTime) : '(Ongoing)'}
                                    </div>
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