// Get Operation Plan By ID Form
const GetOperationPlanByIdForm = () => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [plan, setPlan] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper for time formatting (HH:MM)
    const formatTime = (dateStr) => {
        if (!dateStr) return "--:--";
        const date = new Date(dateStr);
        return isNaN(date) ? "--:--" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleInputChange = (e) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const searchId = searchData.id.trim();
        if (!searchId) {
            setMessage({ type: 'error', text: 'Plan ID is required.' });
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setPlan(null);
        
        try {
            const data = await apiService.getOperationPlanById(searchId);
            if (data) {
                setPlan(data);
                setMessage({ type: 'success', text: 'Plan found successfully.' });
            } else {
                setMessage({ type: 'info', text: 'No plan found with this ID.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to fetch plan.' });
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setPlan(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Search Plan by ID</h4>
                <p>Retrieve full details of a specific operation plan using its unique identifier.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Plan ID (GUID)</label>
                        <input
                            type="text"
                            name="id"
                            id="searchId"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="e.g., a9f86e76-797e..."
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span> Loading...</>) : (<>🎯 Search Plan</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        🔄 Clear
                    </button>
                </div>
            </form>

            {hasSearched && plan && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>Plan Details</h4>
                        <span className="results-count">Date: {plan.scheduleDate}</span>
                    </div>
                    <div className="representative-details-card">
                        {/* Header Metrics */}
                        <div className="rep-header">
                            <h3 className="rep-name">Plan ID: {plan.id}</h3>
                            <span className={`status-badge ${plan.status?.toLowerCase()}`}>{plan.status}</span>
                        </div>
                        <div className="rep-info-grid">
                            <div className="info-group">
                                <label>Heuristic</label>
                                <span>{plan.heuristicUsed}</span>
                            </div>
                            <div className="info-group">
                                <label>Author</label>
                                <span>{plan.author || 'System'}</span>
                            </div>
                            <div className="info-group">
                                <label>Runtime</label>
                                <span>{(plan.algorithmRuntimeSeconds ?? plan.runtimeSeconds ?? 0).toFixed(3)} s</span>
                            </div>
                            <div className="info-group">
                                <label>Total Delay</label>
                                <span style={{color: plan.totalDelayMinutes > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold'}}>
                                    {Math.round(plan.totalDelayMinutes)} min
                                </span>
                            </div>
                            <div className="info-group">
                                <label>Vessel Visits</label>
                                <span>{plan.items?.length || 0}</span>
                            </div>
                        </div>

                        {/* Detailed Table (Matches Modal) */}
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
                                    {plan.items && plan.items.map((item, idx) => (
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
    );
};