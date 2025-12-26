const RejectOperationPlanForm = ({ onSuccess }) => {
    const [planId, setPlanId] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    // Controls the inline confirmation box
    const [showConfirm, setShowConfirm] = React.useState(false);

    const isValidGuid = (guid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guid);

    // Step 1: User clicks "Reject" -> Validate and Show Confirmation UI
    const handleRejectClick = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!planId.trim()) {
            setMessage({ type: 'error', text: 'Plan ID is required.' });
            return;
        }
        if (!isValidGuid(planId.trim())) {
            setMessage({ type: 'error', text: 'Invalid ID format.' });
            return;
        }

        // Show the inline confirmation box instead of window.confirm()
        setShowConfirm(true);
    };

    // Step 2: User confirms inside the UI -> Execute API Call
    const executeReject = async () => {
        setLoading(true);
        // Hide confirm box to prevent double clicks
        setShowConfirm(false); 
        
        try {
            await apiService.rejectOperationPlan(planId.trim());
            
            setMessage({ type: 'success', text: '🚫 Plan rejected successfully.' });
            setPlanId(''); // Clear input
            if (onSuccess) setTimeout(onSuccess, 1500);
        } catch (error) {
            console.error('Reject error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to reject plan.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Reject Operation Plan</h4>
                <p>Discard a plan that is invalid or no longer needed.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="rejectId">Plan ID <span className="required">*</span></label>
                        <input
                            type="text"
                            id="rejectId"
                            value={planId}
                            onChange={(e) => {
                                setPlanId(e.target.value);
                                if (message.text) setMessage({ type: '', text: '' });
                                setShowConfirm(false); // Hide confirm if user changes input
                            }}
                            placeholder="e.g., 898b397a-bd0d..."
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div className="form-actions" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    
                    {!showConfirm ? (
                        /* STANDARD BUTTON */
                        <button 
                            type="button" // Change to button to prevent form submit default
                            onClick={handleRejectClick} 
                            className="submit-btn warning" 
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="loading-spinner"></span> Rejecting...</>
                            ) : (
                                <><span>🛑</span> Reject Plan</>
                            )}
                        </button>
                    ) : (
                        /* INLINE CONFIRMATION BOX */
                        <div style={{
                            width: '100%',
                            border: '1px solid #c0392b',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            padding: '15px',
                            borderRadius: '4px',
                            marginTop: '10px'
                        }}>
                            <p style={{
                                margin: '0 0 15px 0', 
                                color: '#c0392b', 
                                fontWeight: 'bold'
                            }}>
                                ⚠️ Are you sure you want to REJECT this plan? This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="button"
                                    className="submit-btn" 
                                    onClick={executeReject}
                                    style={{
                                        backgroundColor: '#c0392b', 
                                        border: 'none', 
                                        color: 'white'
                                    }}
                                >
                                    Yes, Reject It
                                </button>
                                <button 
                                    type="button"
                                    className="clear-btn" 
                                    onClick={() => setShowConfirm(false)}
                                    style={{ backgroundColor: 'transparent', border: '1px solid #ccc' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};