const UpdateIncidentForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'edit'
    
    // Data
    const [originalData, setOriginalData] = React.useState(null);
    const [formData, setFormData] = React.useState({
        status: '',
        severity: '',
        description: '',
        endTime: ''
    });

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter an ID.' });
            setLoading(false);
            return;
        }

        try {
            const data = await apiService.getIncidentById(searchId.trim());
            
            if (data) {
                // --- NEW CHECK: PREVENT EDITING IF RESOLVED ---
                if (data.status === 'Resolved') {
                    setMessage({ 
                        type: 'error', 
                        text: 'Operation Denied: This incident is already RESOLVED and cannot be modified.' 
                    });
                    setLoading(false);
                    return; // STOP HERE! Do not open the form.
                }
                // ----------------------------------------------

                setOriginalData(data);
                // Populate form with existing data
                setFormData({
                    status: data.status,
                    severity: data.severity,
                    description: data.description || '',
                    endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ''
                });
                setStep('edit');
                setMessage({ type: 'success', text: 'Incident found.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Incident not found.');
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        let newEndTime = formData.endTime;

        // Auto-fill End Time if Resolving
        if (newStatus === 'Resolved' && !newEndTime) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Local time fix
            newEndTime = now.toISOString().slice(0, 16);
        }
        
        // Clear End Time if Re-opening
        if (newStatus === 'Active') {
            newEndTime = '';
        }

        setFormData({ ...formData, status: newStatus, endTime: newEndTime });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.updateIncident(originalData.id, formData);
            
            setMessage({ type: 'success', text: 'Incident updated successfully!' });
            
            if (onSuccess) onSuccess();
            
            // Return to search after short delay
            setTimeout(() => {
                handleClear();
            }, 1500);

        } catch (error) {
            console.error('Update error:', error);
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to update.');
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchId('');
        setStep('search');
        setOriginalData(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #f39c12' }}>
            <div className="form-header">
                <h4 style={{ color: '#f39c12' }}>Resolve / Update Incident</h4>
                <p>Change status to Resolved or modify details.</p>
            </div>

            {/* This message will now show the error immediately if the user searches for a Resolved incident */}
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label>Incident ID</label>
                        <input 
                            type="text" 
                            value={searchId} 
                            onChange={(e) => setSearchId(e.target.value)} 
                            className="form-input" 
                            placeholder="e.g. 64b..." 
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#f39c12'}}>
                        {loading ? 'Searching...' : '🔍 Find Incident'}
                    </button>
                </form>
            )}

            {step === 'edit' && originalData && (
                <form onSubmit={handleUpdate} className="fade-in">
                    
                    {/* Read-Only Context Info */}
                    <div className="context-info-box">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <strong>Type:</strong> {originalData.type?.code}
                            </div>
                            <div>
                                <strong>Started:</strong> {new Date(originalData.startTime).toLocaleString()}
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <strong>Vessel:</strong> {originalData.affectedVessels?.[0]?.name || 'Global'}
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        {/* 1. STATUS */}
                        <div className="form-group">
                            <label>Status <span className="required">*</span></label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleStatusChange}
                                className="form-input"
                                style={{ fontWeight: 'bold', color: formData.status === 'Resolved' ? '#28a745' : '#dc3545' }}
                            >
                                <option value="Active">Active (Ongoing)</option>
                                <option value="Resolved">✅ Resolved (Closed)</option>
                            </select>
                        </div>

                        {/* 2. End Time (Conditional) */}
                        {formData.status === 'Resolved' && (
                            <div className="form-group fade-in">
                                <label>End Time (Resolved At) <span className="required">*</span></label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                    className="form-input"
                                    required
                                />
                            </div>
                        )}

                        {/* 3. Severity */}
                        <div className="form-group">
                            <label>Severity</label>
                            <select
                                value={formData.severity}
                                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                className="form-input"
                            >
                                <option value="Minor">Minor</option>
                                <option value="Major">Major</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        {/* 4. Description */}
                        <div className="form-group full-width">
                            <label>Description / Resolution Notes</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="form-input"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#f39c12'}}>
                            {loading ? 'Saving...' : '💾 Update Incident'}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};