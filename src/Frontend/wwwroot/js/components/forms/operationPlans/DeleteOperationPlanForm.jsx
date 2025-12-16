// Delete Operation Plan Form
const DeleteOperationPlanForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [plan, setPlan] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Plan ID is required.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setPlan(null);

        try {
            const data = await apiService.getOperationPlanById(searchData.id.trim());
            if (data) {
                setPlan(data);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Plan found. Please confirm deletion.' });
            } else {
                setMessage({ type: 'info', text: 'No plan found with this ID.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to find plan.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        // Validation: User must type the Schedule Date to confirm
        if (confirmationText !== plan.scheduleDate) {
            setMessage({ type: 'error', text: 'Confirmation date does not match.' });
            return;
        }

        setIsDeleting(true);
        try {
            await apiService.deleteOperationPlan(plan.id);
            setMessage({ type: 'success', text: 'Plan deleted successfully.' });
            
            if (onSuccess) onSuccess(); // Refresh outer table

            setTimeout(handleClear, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete plan.' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setPlan(null);
        setStep('search');
        setConfirmationText('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Operation Plan</h4>
                <p>Permanently remove a scheduled operation plan.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="deleteId">Plan ID</label>
                            <input
                                type="text"
                                id="deleteId"
                                value={searchData.id}
                                onChange={(e) => setSearchData({ id: e.target.value })}
                                placeholder="Enter Plan GUID"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Searching...' : '🔍 Find Plan'}
                        </button>
                    </div>
                </form>
            )}

            {step === 'confirm' && plan && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Deletion for Plan on <strong>{plan.scheduleDate}</strong></span>
                        <button type="button" className="link-btn" onClick={handleClear}>Cancel</button>
                    </div>
                    <div className="delete-details-card">
                        <div className="delete-details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="delete-details-field">
                                <span className="delete-details-label">ID:</span><br />{plan.id}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Status:</span><br />{plan.status}
                            </div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ This action cannot be undone.</span>
                        <span className="delete-warning-desc">To confirm deletion, please type the plan date: <strong>{plan.scheduleDate}</strong></span>
                        
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder={plan.scheduleDate}
                                    className="delete-confirm-input"
                                    required
                                />
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== plan.scheduleDate}>
                                    {isDeleting ? 'Deleting...' : '🗑️ Delete Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};