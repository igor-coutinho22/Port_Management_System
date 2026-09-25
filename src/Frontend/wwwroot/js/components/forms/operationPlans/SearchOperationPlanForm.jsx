// Search Operation Plans Form (Table + Sorting + Multi-criteria)
const SearchOperationPlanForm = () => {
    // 1. Search State
    const [searchData, setSearchData] = React.useState({ startDate: '', endDate: '', vesselIMO: '' });
    
    // 2. Data State
    const [plans, setPlans] = React.useState([]); 
    const [selectedPlan, setSelectedPlan] = React.useState(null);
    
    // 3. Sorting State
    const [sortConfig, setSortConfig] = React.useState({ key: 'scheduleDate', direction: 'desc' });

    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- Helpers ---
    const formatTime = (dateStr) => {
        if (!dateStr) return "--:--";
        const date = new Date(dateStr);
        return isNaN(date) ? "--:--" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
    };

    // --- Sorting Logic ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPlans = React.useMemo(() => {
        if (!plans) return [];
        let sortableItems = [...plans];
        sortableItems.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Special handling for nested or calculated properties if needed
            if (sortConfig.key === 'vesselCount') {
                aValue = a.items?.length || 0;
                bValue = b.items?.length || 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [plans, sortConfig]);

    // --- API Call ---
    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchData.startDate && !searchData.endDate && !searchData.vesselIMO.trim()) {
            setMessage({ type: 'error', text: 'Please provide at least a Date or a Vessel IMO.' });
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setPlans([]);
        setSelectedPlan(null);
        setMessage({ type: '', text: '' });
        
        try {
            // apiService.searchPlans(start, end, imo)
            // URL: `/api/OperationPlan/Search?startDate=...&endDate=...&vesselIMO=...`
            const data = await apiService.searchOperationPlans(
                searchData.startDate, 
                searchData.endDate, 
                searchData.vesselIMO
            );
            
            const results = Array.isArray(data) ? data : (data ? [data] : []);

            if (results.length > 0) {
                setPlans(results);
                setMessage({ type: 'success', text: `Found ${results.length} plan(s).` });
            } else {
                setMessage({ type: 'info', text: 'No plans found matching your criteria.' });
            }
        } catch (error) {
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'No plans found.' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Search failed.' });
            }
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const handleClear = () => {
        setSearchData({ startDate: '', endDate: '', vesselIMO: '' });
        setPlans([]);
        setSelectedPlan(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    // Helper for Sort Icons
    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span style={{opacity:0.3}}>⇅</span>;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Operation Plans</h4>
                <p>Filter by Date Range or Vessel IMO. Sort results by Delay, Date, or Complexity.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            {/* --- SEARCH FORM --- */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div className="form-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input type="date" name="startDate" id="startDate" value={searchData.startDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endDate">End Date</label>
                        <input type="date" name="endDate" id="endDate" value={searchData.endDate} onChange={handleInputChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="vesselIMO">Vessel IMO</label>
                        <input type="text" name="vesselIMO" id="vesselIMO" value={searchData.vesselIMO} onChange={handleInputChange} placeholder="e.g. 8666692" className="form-input" />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? <><span className="loading-spinner"></span> Searching...</> : <>🔍 Search</>}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>🔄 Clear</button>
                </div>
            </form>

            {/* --- RESULTS SECTION --- */}
            {hasSearched && plans.length > 0 && (
                <div className="results-section">
                    
                    {/* VIEW 1: SORTABLE TABLE */}
                    {!selectedPlan && (
                        <>
                            <div className="results-header">
                                <h4>Search Results ({plans.length})</h4>
                            </div>
                            <div className="table-container">
                                <table className="data-table quick-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort('scheduleDate')} style={{cursor:'pointer'}}>
                                                Date <SortIcon column="scheduleDate"/>
                                            </th>
                                            <th onClick={() => handleSort('totalDelayMinutes')} style={{cursor:'pointer'}}>
                                                Total Delay <SortIcon column="totalDelayMinutes"/>
                                            </th>
                                            <th onClick={() => handleSort('vesselCount')} style={{cursor:'pointer'}}>
                                                Vessels <SortIcon column="vesselCount"/>
                                            </th>
                                            <th onClick={() => handleSort('heuristicUsed')} style={{cursor:'pointer'}}>
                                                Heuristic <SortIcon column="heuristicUsed"/>
                                            </th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPlans.map((plan) => (
                                            <tr key={plan.id} className="hover-row">
                                                <td style={{fontWeight:'bold', color:'#3498db'}}>{plan.scheduleDate}</td>
                                                <td style={{ color: plan.totalDelayMinutes > 0 ? '#e74c3c' : '#2ecc71', fontWeight:'bold' }}>
                                                    {Math.round(plan.totalDelayMinutes)} min
                                                </td>
                                                <td>{plan.items?.length || 0}</td>
                                                <td>{plan.heuristicUsed}</td>
                                                <td>
                                                    <span className={`status-badge ${plan.status?.toLowerCase()}`}>
                                                        {plan.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="action-btn"
                                                        onClick={() => setSelectedPlan(plan)}
                                                        style={{
                                                            background: '#2563eb', color: 'white', border: 'none',
                                                            padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize:'0.85rem'
                                                        }}
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* VIEW 2: DETAILED VIEW (Matches previous detail card) */}
                    {selectedPlan && (
                        <div className="detailed-view-container">
                            <button 
                                onClick={() => setSelectedPlan(null)}
                                style={{
                                    background: 'transparent', border: '1px solid #64748b', color: '#e2e8f0',
                                    padding: '5px 12px', borderRadius: '4px', cursor: 'pointer',
                                    marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px'
                                }}
                            >
                                ⬅ Back to Table
                            </button>

                            <div className="representative-details-card">
                                <div className="rep-header">
                                    <h3 className="rep-name">Plan ID: {selectedPlan.id}</h3>
                                    <span className={`status-badge ${selectedPlan.status?.toLowerCase()}`}>{selectedPlan.status}</span>
                                </div>
                                <div className="rep-info-grid">
                                    <div className="info-group"><label>Heuristic</label><span>{selectedPlan.heuristicUsed}</span></div>
                                    <div className="info-group"><label>Author</label><span>{selectedPlan.author || 'System'}</span></div>
                                    <div className="info-group"><label>Runtime</label><span>{(selectedPlan.algorithmRuntimeSeconds ?? selectedPlan.runtimeSeconds ?? 0).toFixed(3)} s</span></div>
                                    <div className="info-group"><label>Total Delay</label><span style={{color: selectedPlan.totalDelayMinutes > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold'}}>{Math.round(selectedPlan.totalDelayMinutes)} min</span></div>
                                </div>

                                <div className="table-wrapper" style={{ marginTop: '20px', overflowX: 'auto' }}>
                                    <table className="data-table detailed-table" style={{width:'100%', fontSize:'0.9rem'}}>
                                        <thead>
                                            <tr>
                                                <th>IMO</th><th>Visit ID</th><th>Service Slot</th><th style={{color:'#fbbf24'}}>Unloading</th><th style={{color:'#34d399'}}>Loading</th><th>Cranes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedPlan.items && selectedPlan.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{fontWeight:'bold'}}>{item.vesselIMO}</td>
                                                    <td title={item.vesselVisitId}>{item.vesselVisitId.substring(0, 8)}...</td>
                                                    <td>{formatTime(item.serviceStartTime)} - {formatTime(item.serviceEndTime)}</td>
                                                    <td style={{color: '#fcd34d'}}>{formatTime(item.unloadingStartTime)} - {formatTime(item.unloadingEndTime)}</td>
                                                    <td style={{color: '#6ee7b7'}}>{formatTime(item.loadingStartTime)} - {formatTime(item.loadingEndTime)}</td>
                                                    <td style={{textAlign:'center'}}><span className="badge" style={{background:'#334155', padding:'2px 8px', borderRadius:'4px'}}>{item.numberOfCranes}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};