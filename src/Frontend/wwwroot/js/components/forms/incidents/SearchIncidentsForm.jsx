const SearchIncidentsForm = () => {
    // --- STATE ---
    const [filters, setFilters] = React.useState({
        start: '',
        end: '',
        status: 'All',
        severity: 'All',
        vessel: ''
    });

    const [results, setResults] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setResults(null);

        // Filter cleanup: Remove empty fields before sending
        const cleanFilters = {};
        if (filters.start) cleanFilters.start = filters.start;
        if (filters.end) cleanFilters.end = filters.end;
        if (filters.status !== 'All') cleanFilters.status = filters.status;
        if (filters.severity !== 'All') cleanFilters.severity = filters.severity;
        if (filters.vessel.trim()) cleanFilters.vessel = filters.vessel.trim();

        try {
            const data = await apiService.searchIncidents(cleanFilters);
            
            // Sort by Start Time (Newest First)
            const sortedData = (data || []).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
            
            setResults(sortedData);
            
            if (sortedData.length > 0) {
                setMessage({ type: 'success', text: `Found ${sortedData.length} incident(s).` });
            } else {
                setMessage({ type: 'info', text: 'No incidents match your criteria.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to retrieve incidents.');
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFilters({
            start: '',
            end: '',
            status: 'All',
            severity: 'All',
            vessel: ''
        });
        setResults(null);
        setMessage({ type: '', text: '' });
    };

    // --- FORMATTERS ---
    const formatDate = (d) => d ? new Date(d).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-';

    const calculateDuration = (start, end) => {
        if (!start) return '-';
        
        const startTime = new Date(start);
        const endTime = end ? new Date(end) : new Date(); // If no end, calculate vs Now (for Active)
        
        const diffMs = endTime - startTime;
        if (diffMs < 0) return '-';

        const diffMins = Math.floor(diffMs / 60000);
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;

        if (!end) return <span style={{color: '#dc3545', fontWeight:'bold'}}>Ongoing ({h}h {m}m)</span>;
        return `${h}h ${m}m`;
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #6f42c1' }}>
            <div className="form-header">
                <h4 style={{ color: '#6f42c1' }}>Search & History</h4>
                <p>Find past incidents by Date, Vessel, or Severity.</p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    
                    {/* Date Range */}
                    <div className="form-group">
                        <label>From (Start Time)</label>
                        <input
                            type="datetime-local"
                            name="start"
                            value={filters.start}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>To (Start Time)</label>
                        <input
                            type="datetime-local"
                            name="end"
                            value={filters.end}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* Vessel Search */}
                    <div className="form-group">
                        <label>Affected Vessel</label>
                        <input
                            type="text"
                            name="vessel"
                            value={filters.vessel}
                            onChange={handleChange}
                            placeholder="Name, IMO, or ID..."
                            className="form-input"
                        />
                    </div>

                    {/* Status & Severity */}
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleChange} className="form-input">
                            <option value="All">All Statuses</option>
                            <option value="Active">Active (Ongoing)</option>
                            <option value="Resolved">Resolved (Closed)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Severity</label>
                        <select name="severity" value={filters.severity} onChange={handleChange} className="form-input">
                            <option value="All">All Severities</option>
                            <option value="Minor">Minor</option>
                            <option value="Major">Major</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#6f42c1'}}>
                        {loading ? 'Searching...' : '🔍 Search History'}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear}>Clear Filters</button>
                </div>
            </form>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {/* RESULTS TABLE */}
            {results && results.length > 0 && (
                <div className="result-container fade-in" style={{ marginTop: '20px' }}>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Severity</th>
                                    <th>Type</th>
                                    <th>Affected Vessel</th>
                                    <th>Start Time</th>
                                    <th>Duration</th>
                                    <th>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <tr key={r.id}>
                                        <td>
                                            <span 
                                                className="status-badge" 
                                                style={{
                                                    backgroundColor: r.status === 'Resolved' ? '#28a745' : '#dc3545' 
                                                }}
                                            >
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${(r.severity || 'minor').toLowerCase()}`}>
                                                {r.severity}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{r.type?.name || 'Unknown'}</strong><br/>
                                            <small className="monospace-input" style={{color: '#666', fontSize:'0.8em'}}>
                                                {r.type?.code}
                                            </small>
                                        </td>
                                        <td>
                                            {r.affectedVessels && r.affectedVessels.length > 0 ? (
                                                r.affectedVessels.map((v, idx) => (
                                                    <div key={idx} style={{fontSize:'0.9em'}}>🚢 {v.name}</div>
                                                ))
                                            ) : (
                                                <span style={{color:'#999', fontStyle:'italic'}}>Global</span>
                                            )}
                                        </td>
                                        <td>{formatDate(r.startTime)}</td>
                                        <td>
                                            {calculateDuration(r.startTime, r.endTime)}
                                        </td>
                                        <td className="id-cell" title={r.id}>{r.id}</td>
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