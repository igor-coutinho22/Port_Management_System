const SearchTasksForm = () => {
    // --- STATE ---
    const [filters, setFilters] = React.useState({
        status: '',
        vessel: '',
        startDate: '',
        endDate: ''
    });
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        setResults([]);

        try {
            // Remove empty filters
            const query = {};
            if (filters.status) query.status = filters.status;
            if (filters.vessel) query.vessel = filters.vessel;
            if (filters.startDate) query.start = filters.startDate;
            if (filters.endDate) query.end = filters.endDate;

            const data = await apiService.searchComplementaryTasks(query);
            setResults(data || []);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : '-';
    
    // Helper to calculate duration client-side if missing
    const getDuration = (t) => {
        if (t.status === 'Ongoing') return <span style={{color:'#007bff'}}>Running...</span>;
        if (t.durationMinutes) return `${t.durationMinutes} min`;
        if (t.startTime && t.endTime) {
            const diff = Math.floor((new Date(t.endTime) - new Date(t.startTime)) / 60000);
            return `${diff} min`;
        }
        return '-';
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #6f42c1' }}>
            <div className="form-header">
                <h4 style={{ color: '#6f42c1' }}>Search History</h4>
                <p>Filter operations log by vessel, status, or date.</p>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleChange} className="form-input">
                            <option value="">Any Status</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Vessel (Name or IMO)</label>
                        <input 
                            name="vessel" 
                            value={filters.vessel} 
                            onChange={handleChange} 
                            className="form-input" 
                            placeholder="e.g. Maersk" 
                        />
                    </div>
                    <div className="form-group">
                        <label>From Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>To Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className="form-input" />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#6f42c1'}}>
                        {loading ? 'Searching...' : '🔍 Search Logs'}
                    </button>
                </div>
            </form>

            {/* RESULTS */}
            {hasSearched && (
                <div className="table-container fade-in" style={{ marginTop: '20px', maxHeight:'400px', overflowY:'auto' }}>
                    {results.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No tasks found matching criteria.</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Operation</th>
                                    <th>Vessel</th>
                                    <th>Start Time</th>
                                    <th>Duration</th>
                                    <th>Team</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className="status-badge" style={{
                                                backgroundColor: t.status === 'Ongoing' ? '#007bff' : '#28a745'
                                            }}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>
                                            {t.category ? t.category.name : 'Unknown'}
                                            <div style={{fontSize:'0.8em', color:'#aaa'}}>{t.category?.code}</div>
                                        </td>
                                        <td style={{color:'#17a2b8', fontWeight:'bold'}}>
                                            {t.vesselName || (t.vesselVisitExecutionId?.vesselIMO ? `IMO: ${t.vesselVisitExecutionId.vesselIMO}` : '-')}
                                        </td>
                                        <td>{formatDate(t.startTime)}</td>
                                        <td>{getDuration(t)}</td>
                                        <td>{t.responsibleTeam}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};