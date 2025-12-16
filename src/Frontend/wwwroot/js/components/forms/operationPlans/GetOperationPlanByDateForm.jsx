// Get Operation Plan By Date Form
const GetOperationPlanByDateForm = () => {
    const [searchData, setSearchData] = React.useState({ date: '' });
    const [plans, setPlans] = React.useState([]); // Store the list of plans
    const [selectedPlan, setSelectedPlan] = React.useState(null); // Store the specific plan clicked
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper for time formatting
    const formatTime = (dateStr) => {
        if (!dateStr) return "--:--";
        const date = new Date(dateStr);
        return isNaN(date) ? "--:--" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.date) {
            setMessage({ type: 'error', text: 'Please select a date.' });
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setPlans([]);
        setSelectedPlan(null); // Reset selection
        
        try {
            const data = await apiService.getOperationPlanByDate(searchData.date);
            
            // Ensure we handle both Array (new behavior) and Single Object (legacy behavior)
            const results = Array.isArray(data) ? data : (data ? [data] : []);

            if (results.length > 0) {
                setPlans(results);
                setMessage({ type: 'success', text: `Found ${results.length} plan(s) for this date.` });
            } else {
                setMessage({ type: 'info', text: 'No plans found for this date.' });
            }
        } catch (error) {
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'No plan exists for this date.' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch plans.' });
            }
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const handleClear = () => {
        setSearchData({ date: '' });
        setPlans([]);
        setSelectedPlan(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Plan by Date</h4>
                <p>Find operation schedules for a specific day.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            {/* SEARCH FORM */}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchDate">Schedule Date</label>
                        <input
                            type="date"
                            name="date"
                            id="searchDate"
                            value={searchData.date}
                            onChange={(e) => setSearchData({ date: e.target.value })}
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span> Loading...</>) : (<>📅 Search Date</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        🔄 Clear
                    </button>
                </div>
            </form>

            {/* RESULTS SECTION */}
            {hasSearched && plans.length > 0 && (
                <div className="results-section">
                    
                    {/* SCENARIO 1: LIST VIEW (Show if no plan is selected) */}
                    {!selectedPlan && (
                        <>
                            <div className="results-header">
                                <h4>Available Plans</h4>
                                <span className="results-count">{plans.length} Found</span>
                            </div>
                            <div className="plans-list-grid" style={{ display: 'grid', gap: '15px' }}>
                                {plans.map((plan, index) => (
                                    <div 
                                        key={plan.id} 
                                        className="plan-summary-card" 
                                        style={{ 
                                            background: '#1e293b', 
                                            padding: '15px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #334155',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div className="plan-info">
                                            <div style={{color:'#38bdf8', fontWeight:'bold', marginBottom:'4px'}}>
                                                Plan #{index + 1}
                                            </div>
                                            <div style={{fontSize:'0.85rem', color:'#94a3b8', fontFamily:'monospace'}}>
                                                ID: {plan.id}
                                            </div>
                                            <div style={{fontSize:'0.9rem', color:'white', marginTop:'5px'}}>
                                                <span style={{marginRight:'15px'}}>🤖 {plan.heuristicUsed}</span>
                                                <span>👤 {plan.author || 'System'}</span>
                                            </div>
                                        </div>
                                        <button 
                                            className="view-details-btn"
                                            onClick={() => setSelectedPlan(plan)}
                                            style={{
                                                background: '#2563eb',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            View Details ➜
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* SCENARIO 2: DETAIL VIEW (Show if a plan is selected) */}
                    {selectedPlan && (
                        <div className="detailed-view-container">
                            <button 
                                onClick={() => setSelectedPlan(null)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #64748b',
                                    color: '#e2e8f0',
                                    padding: '5px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    marginBottom: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                ⬅ Back to List
                            </button>

                            <div className="representative-details-card">
                                {/* Reuse the same detailed layout as GetById */}
                                <div className="rep-header">
                                    <h3 className="rep-name">Plan ID: {selectedPlan.id}</h3>
                                    <span className={`status-badge ${selectedPlan.status?.toLowerCase()}`}>{selectedPlan.status}</span>
                                </div>
                                <div className="rep-info-grid">
                                    <div className="info-group">
                                        <label>Heuristic</label>
                                        <span>{selectedPlan.heuristicUsed}</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Author</label>
                                        <span>{selectedPlan.author || 'System'}</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Runtime</label>
                                        <span>{(selectedPlan.algorithmRuntimeSeconds ?? selectedPlan.runtimeSeconds ?? 0).toFixed(3)} s</span>
                                    </div>
                                    <div className="info-group">
                                        <label>Total Delay</label>
                                        <span style={{color: selectedPlan.totalDelayMinutes > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold'}}>
                                            {Math.round(selectedPlan.totalDelayMinutes)} min
                                        </span>
                                    </div>
                                    <div className="info-group">
                                        <label>Vessel Visits</label>
                                        <span>{selectedPlan.items?.length || 0}</span>
                                    </div>
                                </div>

                                {/* Full Table */}
                                <div className="table-wrapper" style={{ marginTop: '20px', overflowX: 'auto' }}>
                                    <table className="data-table detailed-table" style={{width:'100%', fontSize:'0.9rem'}}>
                                        <thead>
                                            <tr>
                                                <th>IMO</th>
                                                <th>Visit ID</th>
                                                <th>Service Slot</th>
                                                <th style={{color:'#fbbf24'}}>Unloading Window</th>
                                                <th style={{color:'#34d399'}}>Loading Window</th>
                                                <th>Cranes</th>
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
                                                    <td style={{textAlign:'center'}}>
                                                        <span className="badge" style={{background:'#334155', padding:'2px 8px', borderRadius:'4px'}}>
                                                            {item.numberOfCranes}
                                                        </span>
                                                    </td>
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