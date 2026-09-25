const ApproveOperationPlanForm = ({ onSuccess }) => {
    const [planId, setPlanId] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const isValidGuid = (guid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guid);

    const handleApprove = async (e) => {
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

        setLoading(true);
        try {
            // Note: If your API route is /approve?id=... vs /approve/{id}, adjust accordingly.
            // Based on your controller [HttpPut("approve")], it likely expects ID in query or body depending on setup.
            // PUT /api/operationPlan/approve?id={planId}
            await apiService.approveOperationPlan(planId.trim());
            
            setMessage({ type: 'success', text: '✅ Operation Plan approved successfully.' });
            setPlanId(''); // Clear input
            if (onSuccess) setTimeout(onSuccess, 1500);
        } catch (error) {
            console.error('Approve error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to approve plan.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Approve Operation Plan</h4>
                <p>Finalize a draft plan and mark it ready for execution.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleApprove} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="approveId">Plan ID <span className="required">*</span></label>
                        <input
                            type="text"
                            id="approveId"
                            value={planId}
                            onChange={(e) => {
                                setPlanId(e.target.value);
                                if (message.text) setMessage({ type: '', text: '' });
                            }}
                            placeholder="e.g., 898b397a-bd0d..."
                            className="form-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn success" disabled={loading}>
                        {loading ? (
                            <><span className="loading-spinner"></span> Approving...</>
                        ) : (
                            <><span>✅</span> Approve Plan</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};