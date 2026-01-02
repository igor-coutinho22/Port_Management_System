const CompleteVesselVisitExecutionForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'complete'
    
    // Data
    const [execution, setExecution] = React.useState(null);
    const [validationError, setValidationError] = React.useState(null);

    // Form Data
    const [formData, setFormData] = React.useState({
        unberthTime: '',
        portDepartureTime: '',
        author: ''
    });

    // UI
    const [loading, setLoading] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) { setMessage({ type: 'error', text: 'Execution ID required' }); return; }

        setLoading(true);
        setMessage({ type: '', text: '' });
        setValidationError(null);

        try {
            const data = await apiService.getVesselVisitExecutionById(searchId.trim());
            
            if (data) {
                setExecution(data);
                validateForCompletion(data);
            } else {
                setMessage({ type: 'error', text: 'Execution not found.' });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Error fetching data.' });
        } finally {
            setLoading(false);
        }
    };

    // Logic to check if we are ALLOWED to complete this visit
    const validateForCompletion = (data) => {
        // 1. Already Completed?
        if (data.status === 'Completed') {
            setValidationError('This execution is already marked as COMPLETED.');
            setStep('search'); // Stay on search, show error
            return;
        }

        // 2. Unfinished Operations?
        if (data.executedOperations && data.executedOperations.length > 0) {
            const pending = data.executedOperations.filter(op => op.status !== 'Completed');
            if (pending.length > 0) {
                setValidationError(`Cannot complete: There are ${pending.length} unfinished operations. Please mark them as Completed first.`);
                setStep('search');
                return;
            }
        }

        // If checks pass, move to next step
        setStep('complete');
        setMessage({ type: 'success', text: 'Execution ready for completion.' });
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                unberthTime: new Date(formData.unberthTime).toISOString(),
                portDepartureTime: new Date(formData.portDepartureTime).toISOString(),
                author: formData.author
            };

            const response = await apiService.completeVesselVisitExecution(execution.id, payload);
            
            setMessage({ type: 'success', text: 'Vessel Visit successfully COMPLETED!' });
            
            // Lock form / Reset after delay
            setTimeout(() => {
                if (onSuccess) onSuccess();
                handleClear();
            }, 2000);

        } catch (error) {
            console.error('Completion error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to complete execution.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setSearchId('');
        setStep('search');
        setExecution(null);
        setValidationError(null);
        setFormData({ unberthTime: '', portDepartureTime: '', author: '' });
        setMessage({ type: '', text: '' });
    };

    // --- RENDER HELPERS ---
    const formatDate = (d) => new Date(d).toLocaleString();

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Complete Vessel Visit</h4>
                <p>Record departure times to close the visit lifecycle (US 4.1.11).</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <div className="fade-in">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Execution ID</label>
                                <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="form-input" placeholder="e.g., c00b3ef3..." />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Checking...' : '🔍 Find & Validate'}
                            </button>
                        </div>
                    </form>

                    {/* Validation Error Display */}
                    {validationError && (
                        <div className="error-box" style={{marginTop: '20px', padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', border: '1px solid #f5c6cb'}}>
                            <strong>⚠️ Action Blocked:</strong> {validationError}
                            {execution && execution.executedOperations && (
                                <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                                    {execution.executedOperations.filter(op => op.status !== 'Completed').map(op => (
                                        <li key={op.operationId}>Pending Op: {op.type} (Status: {op.status})</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}

            {step === 'complete' && execution && (
                <div className="fade-in">
                    <div className="context-info-box" style={{marginBottom: '20px', padding: '15px', background: '#e2e3e5', borderRadius: '6px'}}>
                        <strong>Vessel:</strong> {execution.vesselIMO} <br/>
                        <strong>Arrival:</strong> {formatDate(execution.actualArrivalTime)}
                    </div>

                    <form onSubmit={handleComplete} className="dock-form">
                        <div className="form-divider-label">Departure Details</div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Actual Unberth Time <span className="required">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.unberthTime} 
                                    onChange={(e) => setFormData({...formData, unberthTime: e.target.value})} 
                                    className="form-input" 
                                    required 
                                />
                                <small>Time vessel left the dock</small>
                            </div>

                            <div className="form-group">
                                <label>Actual Port Departure <span className="required">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    value={formData.portDepartureTime} 
                                    onChange={(e) => setFormData({...formData, portDepartureTime: e.target.value})} 
                                    className="form-input" 
                                    required 
                                />
                                <small>Time vessel exited port limits</small>
                            </div>

                            <div className="form-group" style={{gridColumn: '1/-1'}}>
                                <label>Author <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.author} 
                                    onChange={(e) => setFormData({...formData, author: e.target.value})} 
                                    className="form-input" 
                                    placeholder="Sign to close this visit" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="warning-text" style={{margin: '15px 0', color: '#856404', fontSize: '0.9em'}}>
                            ⚠️ <strong>Warning:</strong> This action is final. Once completed, the execution record will become Read-Only.
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn success" disabled={isSubmitting}>
                                {isSubmitting ? 'Closing Visit...' : '✅ Confirm Completion'}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isSubmitting}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};