console.log('✏️ UpdateVesselVisitExecutionForm component loading...');

const UpdateVesselVisitExecutionForm = ({ onSuccess }) => {
    // 1. State Management
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'edit'
    
    // Data States
    const [originalVVE, setOriginalVVE] = React.useState(null);

    // Form State
    const [formData, setFormData] = React.useState({
        berthTime: '',
        dockId: '',
        author: ''
    });

    // UI States
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- Helpers ---

    const formatForInput = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const offset = date.getTimezoneOffset() * 60000;
            return (new Date(date - offset)).toISOString().slice(0, 16);
        } catch (e) { return ''; }
    };

    // --- Handlers ---

    const handleSearchChange = (e) => {
        setSearchId(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) { setMessage({ type: 'error', text: 'Execution ID is required' }); return; }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setOriginalVVE(null);

        try {
            // Fetch VVE Data
            const vveData = await apiService.getVesselVisitExecutionById(searchId.trim());

            if (vveData) {
                setOriginalVVE(vveData);
                
                // Pre-fill form
                const timeToUse = vveData.berthTime || vveData.actualArrivalTime;

                setFormData({
                    berthTime: formatForInput(timeToUse),
                    dockId: vveData.dockId || '',
                    author: '' 
                });

                setStep('edit');
                setMessage({ type: 'success', text: 'Execution found.' });
            } else {
                setMessage({ type: 'info', text: 'Vessel Visit Execution not found.' });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: error.message || 'Error fetching execution' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                berthTime: new Date(formData.berthTime).toISOString(),
                dockId: formData.dockId ? formData.dockId.trim() : null,
                author: formData.author
            };

            const response = await apiService.updateVesselVisitExecution(originalVVE.id, payload);

            if (response && response.latestDiscrepancy) {
                 setMessage({ type: 'warning', text: `Updated with warning: ${response.latestDiscrepancy}` });
            } else {
                 setMessage({ type: 'success', text: 'Vessel Visit Execution updated successfully.' });
            }

            setTimeout(() => {
                if (onSuccess) onSuccess();
                handleClear();
            }, 2000);

        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: error.message || 'Error updating execution' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchId('');
        setStep('search');
        setOriginalVVE(null);
        setFormData({ berthTime: '', dockId: '', author: '' });
        setMessage({ type: '', text: '' });
    };

    const handleNewSearch = () => {
        handleClear();
    };

    const isDockChanged = originalVVE && formData.dockId && originalVVE.dockId && formData.dockId !== originalVVE.dockId;

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Update Vessel Visit Execution</h4>
                <p>Search for an execution to record actual berth time and dock.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Execution ID</label>
                            <input 
                                type="text" 
                                id="searchId" 
                                value={searchId} 
                                onChange={handleSearchChange} 
                                placeholder="e.g., c00b3ef3..." 
                                className="form-input" 
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? <span className="loading-spinner"></span> : <span>🔍</span>} Search Execution
                        </button>
                    </div>
                </form>
            )}

            {step === 'edit' && originalVVE && (
                <div className="fade-in">
                    <div className="form-section-header">
                        <h5>Editing Execution: <strong>{originalVVE.vesselIMO}</strong></h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span style={{ marginRight: '4px' }}>🔍</span>Search different execution
                        </button>
                    </div>

                    <div className="context-info-box" style={{ 
                        marginBottom: '20px', 
                        padding: '15px', 
                        backgroundColor: '#e3f2fd', 
                        color: '#0d47a1', 
                        borderRadius: '6px', 
                        borderLeft: '4px solid #2196F3' 
                    }}>
                        <strong className="context-title" style={{color: '#1565c0', display: 'block', marginBottom: '10px', fontSize: '1.1em'}}>
                            ℹ️ Current Status: {originalVVE.status}
                        </strong>
                        <div className="context-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <div>
                                <span style={{ fontSize: '0.9em', color: '#455a64', fontWeight: '500' }}>Vessel IMO:</span><br/>
                                <strong style={{ fontSize: '1.1em', color: '#000' }}>{originalVVE.vesselIMO}</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.9em', color: '#455a64', fontWeight: '500' }}>Original Arrival:</span><br/>
                                <strong style={{ fontSize: '1.1em', color: '#000' }}>
                                    {new Date(originalVVE.actualArrivalTime).toLocaleString()}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} className="dock-form">
                        <div className="form-divider-label">Berthing Details</div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Actual Berth Time <span className="required">*</span></label>
                                <input 
                                    type="datetime-local" 
                                    name="berthTime" 
                                    value={formData.berthTime} 
                                    onChange={handleInputChange} 
                                    className="form-input" 
                                    required 
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Assigned Dock ID <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    name="dockId" 
                                    value={formData.dockId} 
                                    onChange={handleInputChange} 
                                    className="form-input" 
                                    placeholder="e.g., 20c24385-28b9..."
                                    required
                                />
                            </div>
                        </div>

                        {isDockChanged && (
                            <div className="discrepancy-warning-box">
                                ⚠️ <strong>Potential Discrepancy:</strong> You are assigning a dock different from the one previously saved. This will be logged.
                            </div>
                        )}

                        <div className="form-divider-label">Audit Log (Required)</div>
                        <div className="form-grid">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Author <span className="required">*</span></label>
                                <input 
                                    type="text" 
                                    name="author" 
                                    value={formData.author} 
                                    onChange={handleInputChange} 
                                    className="form-input" 
                                    placeholder="Enter your name to sign this update" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? <><span className="loading-spinner"></span> Updating...</> : <><span>💾</span> Save Changes</>}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                                <span>🧹</span> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};