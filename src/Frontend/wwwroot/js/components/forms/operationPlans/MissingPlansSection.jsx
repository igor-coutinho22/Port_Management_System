const MissingPlansSection = () => {
    const [targetDate, setTargetDate] = React.useState(new Date().toISOString().split('T')[0]);
    
    // Data State
    const [missingVisits, setMissingVisits] = React.useState([]);
    const [existingPlans, setExistingPlans] = React.useState([]);
    
    // Selection State
    const [selectedPlanId, setSelectedPlanId] = React.useState(null);

    // UI State
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [successMsg, setSuccessMsg] = React.useState(null); 
    const [regenerating, setRegenerating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    // --- Actions ---

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        setShowConfirm(false);
        setMissingVisits([]);
        setExistingPlans([]);
        setSelectedPlanId(null);
        setHasSearched(false);

        try {
            // 1. Get Missing VVNs
            let missingData = [];
            try {
                missingData = await apiService.getMissingOperationPlans(targetDate);
            } catch (err) {
                if (!err.message.includes("404")) throw err;
            }
            setMissingVisits(missingData || []);

            // 2. Get Existing Plans
            let drafts = [];
            try {
                const plansData = await apiService.searchOperationPlans(targetDate, targetDate, "");
                drafts = (plansData || []).filter(p => p.status === 'Draft');
            } catch (err) {
                if (!err.message.includes("404") && !err.message.includes("No operation plans found")) {
                    console.error("Search error:", err);
                }
            }
            setExistingPlans(drafts);
            setHasSearched(true);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch data: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    // Step 1: User clicks "Regenerate" -> Show confirmation box
    const handleRegenerateClick = () => {
        setError(null);
        setSuccessMsg(null);
        if (!selectedPlanId) {
            setError("Please select an existing plan to regenerate.");
            return;
        }
        setShowConfirm(true); // Show inline UI instead of popup
    };

    // Step 2: User confirms inside the UI -> Execute
    const executeRegeneration = async () => {
        const planToRegenerate = existingPlans.find(p => p.id === selectedPlanId);
        if (!planToRegenerate) return;

        setRegenerating(true);
        setShowConfirm(false); // Hide confirmation box
        
        try {
            // Calls backend
            await apiService.regenerateOperationPlan(targetDate, planToRegenerate.heuristicUsed);
            
            setSuccessMsg(`Plan regenerated successfully! The algorithm '${planToRegenerate.heuristicUsed}' has been re-run.`);
            
            // Refresh results
            setTimeout(() => {
                handleSearch(null); 
            }, 1000);

        } catch (err) {
            setError("Regeneration Failed: " + err.message);
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Analyze & Repair Daily Schedule</h4>
                <p>Find vessel visits not included in any plan and regenerate specific drafts to include them.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="search-form" style={{ marginBottom: '20px' }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Target Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : <span>🔍</span>}
                        Check Date
                    </button>
                </div>
            </form>

            {/* Messages */}
            {error && <div className="message error" style={{marginBottom: '15px'}}>{error}</div>}
            {successMsg && <div className="message success" style={{marginBottom: '15px'}}>{successMsg}</div>}

            {/* Results Area */}
            {hasSearched && !loading && (
                <div className="analysis-results">
                    
                    {/* LEFT COL: Missing Visits */}
                    <div className="result-column">
                        <h5 style={{ color: '#e74c3c' }}>
                            ⚠️ Missing Visits ({missingVisits.length})
                        </h5>
                        {missingVisits.length === 0 ? (
                            <div className="success-box">✅ All visits are scheduled.</div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table small-table">
                                    <thead>
                                        <tr>
                                            <th>IMO</th>
                                            <th>Arrival</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {missingVisits.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.vesselIMO}</td>
                                                {/* FIXED: Using 'arrivalTime' or 'ArrivalTime' */}
                                                <td>
                                                    {v.arrivalTime || v.ArrivalTime 
                                                        ? new Date(v.arrivalTime || v.ArrivalTime).toLocaleTimeString() 
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Existing Plans Selector */}
                    <div className="result-column">
                        <h5 style={{ color: '#3498db' }}>
                            📄 Draft Plans for {targetDate}
                        </h5>
                        
                        {existingPlans.length === 0 ? (
                            <p className="no-data-msg">No draft plans found for this date.</p>
                        ) : (
                            <div className="plans-list">
                                <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '10px' }}>
                                    Select a plan to regenerate using its algorithm:
                                </p>
                                {existingPlans.map(plan => (
                                    <div 
                                        key={plan.id} 
                                        className={`plan-card ${selectedPlanId === plan.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedPlanId(plan.id)}
                                    >
                                        <div className="plan-card-heuristic">{plan.heuristicUsed}</div>
                                        <div className="plan-card-details">
                                            Delay: {Math.round(plan.totalDelayMinutes)} min | Items: {plan.items ? plan.items.length : 0}
                                        </div>
                                        <div className="plan-card-id">ID: {plan.id}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Regenerate Action Area */}
                        <div style={{ marginTop: '15px' }}>
                            
                            {!showConfirm ? (
                                /* Normal Button */
                                <button
                                    className="submit-btn warning"
                                    onClick={handleRegenerateClick}
                                    disabled={regenerating || !selectedPlanId || missingVisits.length === 0}
                                    style={{ width: '100%' }}
                                >
                                    {regenerating ? (
                                        <><span className="loading-spinner"></span> Regenerating...</>
                                    ) : (
                                        <>⚡ Regenerate Selected Plan</>
                                    )}
                                </button>
                            ) : (
                                /* INLINE CONFIRMATION BOX (Replaces Popup) */
                                <div style={{
                                    border: '1px solid #f39c12',
                                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{margin: '0 0 10px 0', fontSize: '0.9em', color: '#e67e22', fontWeight: 'bold'}}>
                                        Are you sure? This will overwrite the plan.
                                    </p>
                                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                                        <button 
                                            className="submit-btn" 
                                            onClick={executeRegeneration}
                                            style={{backgroundColor: '#e67e22', border: 'none', padding: '5px 15px', fontSize: '0.9em'}}
                                        >
                                            Yes, Proceed
                                        </button>
                                        <button 
                                            className="clear-btn" 
                                            onClick={() => setShowConfirm(false)}
                                            style={{padding: '5px 15px', fontSize: '0.9em'}}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {missingVisits.length > 0 && !selectedPlanId && existingPlans.length > 0 && (
                                <small style={{ color: '#e74c3c', display: 'block', marginTop: '5px' }}>
                                    * Select a plan above to fix
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};