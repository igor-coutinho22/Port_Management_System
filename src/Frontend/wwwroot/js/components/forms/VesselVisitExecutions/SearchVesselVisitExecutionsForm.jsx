const SearchVesselVisitExecutionsForm = () => {
    // Filters
    const [filters, setFilters] = React.useState({
        start: '',
        end: '',
        vessel: '',
        status: 'All'
    });

    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(true);
        try {
            // Build payload, removing empty fields
            const queryParams = {};
            if (filters.start) queryParams.start = new Date(filters.start).toISOString();
            if (filters.end) queryParams.end = new Date(filters.end).toISOString();
            if (filters.vessel.trim()) queryParams.vessel = filters.vessel.trim();
            if (filters.status !== 'All') queryParams.status = filters.status;

            const data = await apiService.searchVesselVisitExecutions(queryParams);
            setResults(data || []);
        } catch (error) {
            console.error("Search failed", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Format minutes into "2h 15m"
    const formatDuration = (mins) => {
        // 1. Only return '-' if data is actually missing (null/undefined)
        if (mins === null || mins === undefined) return '-';
        
        // 2. If it's exactly 0, show it!
        if (mins === 0) return '0m';

        // 3. Handle negatives (e.g. data entry error)
        if (mins < 0) return '-';

        const h = Math.floor(mins / 60);
        const m = mins % 60;
        
        // Make it look nice
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search & Analyze History</h4>
                <p>Filter execution records and view performance metrics.</p>
            </div>

            {/* --- FILTER BAR --- */}
            <form onSubmit={handleSearch} className="search-form" style={{background: '#f1f3f5', padding: '15px', borderRadius: '8px'}}>
                <div className="form-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px'}}>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="start" value={filters.start} onChange={handleFilterChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" name="end" value={filters.end} onChange={handleFilterChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Vessel (IMO/ID)</label>
                        <input type="text" name="vessel" value={filters.vessel} onChange={handleFilterChange} placeholder="e.g. 2221610" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-input">
                            <option value="All">All Statuses</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="form-actions" style={{marginTop: '10px'}}>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Searching...' : '🔍 Search Records'}
                    </button>
                </div>
            </form>

            {/* --- RESULTS TABLE --- */}
            {hasSearched && (
                <div className="results-section fade-in" style={{marginTop: '20px'}}>
                    <h5 style={{marginBottom: '10px', color: '#495057'}}>
                        Results ({results.length})
                    </h5>
                    
                    {results.length === 0 ? (
                        <div className="no-data">No records match your criteria.</div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>IMO</th>
                                        <th>Arrival</th>
                                        <th>Status</th>
                                        {/* METRICS COLUMNS */}
                                        <th title="Time from Arrival to Berth">Wait Time</th>
                                        <th title="Time spent at Berth">Berth Time</th>
                                        <th title="Total time in port">Turnaround</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(r => (
                                        <tr key={r.id}>
                                            <td style={{fontWeight: 'bold'}}>{r.vesselIMO}</td>
                                            <td>{formatDate(r.actualArrivalTime)}</td>
                                            <td>
                                                <span className={`status-badge status-${(r.status||'').toLowerCase()}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            
                                            {/* METRICS DISPLAY */}
                                            <td style={{color: r.metrics.waitingTimeMinutes > 60 ? '#d63384' : 'inherit'}}>
                                                {formatDuration(r.metrics.waitingTimeMinutes)}
                                            </td>
                                            <td>{formatDuration(r.metrics.berthOccupancyMinutes)}</td>
                                            <td style={{fontWeight: 'bold'}}>
                                                {formatDuration(r.metrics.totalTurnaroundMinutes)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};