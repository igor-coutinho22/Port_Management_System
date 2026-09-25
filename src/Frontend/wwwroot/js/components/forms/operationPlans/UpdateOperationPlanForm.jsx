// Update Operation Plan Form Component

const UpdateOperationPlanForm = ({ onSuccess }) => {
    // 1. Safe Translation Hook
    const t = (key) => {
        if (window.translations && window.translations.en && window.translations.en[key]) {
            return window.translations.en[key];
        }
        return key;
    };
    
    // 2. State Management
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); 
    const [originalPlan, setOriginalPlan] = React.useState(null);
    const [vesselContext, setVesselContext] = React.useState(null); 
    
    const [formData, setFormData] = React.useState({
        serviceStartTime: '',
        serviceEndTime: '',
        numberOfStaff: 0,
        numberOfCranes: 0,
        author: '', 
        reasonForChange: '' 
    });

    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [warnings, setWarnings] = React.useState([]); 

    // --- Helpers ---

    const formatForInput = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const offset = date.getTimezoneOffset() * 60000;
            return (new Date(date - offset)).toISOString().slice(0, 16);
        } catch (e) { return ''; }
    };

    const formatForApi = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString();
    };

    const isValidGuid = (guid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guid);

    const calculateCurrentDuration = () => {
        if (!formData.serviceStartTime || !formData.serviceEndTime) return 0;
        const start = new Date(formData.serviceStartTime);
        const end = new Date(formData.serviceEndTime);
        const diffMs = end - start;
        return diffMs > 0 ? Math.floor(diffMs / 60000) : 0;
    };

    // --- DATA FINDER ---
    const findValue = (obj, keyCandidates) => {
        if (!obj) return 0;
        for (const key of keyCandidates) {
            if (obj[key] !== undefined && obj[key] !== null) return obj[key];
        }
        const inner = obj.value || obj.data || obj.item;
        if (inner) {
            for (const key of keyCandidates) {
                if (inner[key] !== undefined && inner[key] !== null) return inner[key];
            }
        }
        return 0;
    };

    const getMinLoad = (ctx) => findValue(ctx, [
        'estimatedLoadingDurationMinutes', 'EstimatedLoadingDurationMinutes',
        'minLoadMinutes', 'MinLoadMinutes', 
        'loadDuration', 'LoadDuration'
    ]);

    const getMinUnload = (ctx) => findValue(ctx, [
        'estimatedUnloadingDurationMinutes', 'EstimatedUnloadingDurationMinutes',
        'minUnloadMinutes', 'MinUnloadMinutes', 
        'unloadDuration', 'UnloadDuration'
    ]);

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
        if (!searchId.trim()) { setMessage({ type: 'error', text: 'Plan ID is required' }); return; }
        if (!isValidGuid(searchId.trim())) { setMessage({ type: 'error', text: 'Invalid GUID format' }); return; }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setWarnings([]);
        setVesselContext(null);

        try {
            const data = await apiService.getOperationPlanById(searchId.trim());
            const items = data.items || data.Items;

            if (data && items && items.length > 0) {
                setOriginalPlan(data);
                const mainItem = items[0]; 
                
                const vvnId = mainItem.vesselVisitId || mainItem.VesselVisitId;
                if (vvnId) {
                    try {
                        const vvnData = await apiService.getVesselVisitNotificationById(vvnId);
                        setVesselContext(vvnData);
                    } catch (vvnError) {
                        console.warn('❌ Could not fetch VVN context:', vvnError);
                        setMessage({ type: 'warning', text: 'Warning: Could not fetch vessel details.' });
                    }
                }

                setFormData({
                    serviceStartTime: formatForInput(mainItem.serviceStartTime || mainItem.ServiceStartTime),
                    serviceEndTime: formatForInput(mainItem.serviceEndTime || mainItem.ServiceEndTime),
                    numberOfStaff: mainItem.numberOfStaff || mainItem.NumberOfStaff,
                    numberOfCranes: mainItem.numberOfCranes || mainItem.NumberOfCranes,
                    author: '', 
                    reasonForChange: '' 
                });
                
                setStep('edit');
                setMessage({ type: 'success', text: 'Plan found.' });
            } else {
                setMessage({ type: 'info', text: 'Operation Plan not found.' });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: error.message || 'Error fetching plan' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });
        setWarnings([]);

        const start = new Date(formData.serviceStartTime);
        const end = new Date(formData.serviceEndTime);

        if (start >= end) {
            setMessage({ type: 'error', text: 'End time must be after Start time.' });
            setIsUpdating(false);
            return;
        }

        // --- VALIDATION: CRANE SCALING ---
        const durationMs = end - start;
        const durationMinutes = Math.floor(durationMs / 1000 / 60);
        
        const minLoad = getMinLoad(vesselContext);
        const minUnload = getMinUnload(vesselContext);
        const totalWorkload = minLoad + minUnload;
        
        // Use user selected cranes (or 1 if invalid/zero)
        const cranes = Math.max(1, parseInt(formData.numberOfCranes) || 1);
        
        // Calculate required wall-clock time
        const minTotalRequired = Math.ceil(totalWorkload / cranes);

        // Allow a tiny buffer (e.g. 1 min) for rounding errors
        if (totalWorkload > 0 && durationMinutes < (minTotalRequired - 1)) {
            setMessage({ 
                type: 'error', 
                text: `IMPOSSIBLE SCHEDULE: Selected ${durationMinutes} min. With ${cranes} crane(s), the minimum time required is ${minTotalRequired} min (Workload: ${totalWorkload} / ${cranes}).` 
            });
            setIsUpdating(false);
            return; 
        }

        try {
            const items = originalPlan.items || originalPlan.Items;
            const originalItem = items[0];
            const itemId = originalItem.id || originalItem.Id || originalItem.itemId || originalItem.ItemId;

            const payload = {
                Item: {
                    ItemId: itemId,
                    ServiceStartTime: formatForApi(formData.serviceStartTime),
                    ServiceEndTime: formatForApi(formData.serviceEndTime),
                    NumberOfCranes: parseInt(formData.numberOfCranes),
                    NumberOfStaff: parseInt(formData.numberOfStaff),
                    MinUnloadMinutes: minUnload,
                    MinLoadMinutes: minLoad
                },
                Author: formData.author,
                Reason: formData.reasonForChange 
            };

            const planId = originalPlan.id || originalPlan.Id;
            const response = await apiService.updateOperationPlan(planId, payload);

            if (response && response.warnings && response.warnings.length > 0) {
                 setWarnings(response.warnings);
                 setMessage({ type: 'warning', text: 'Plan updated with warnings.' });
            } else {
                 setMessage({ type: 'success', text: 'Plan updated successfully.' });
                 setTimeout(() => {
                     if (onSuccess) onSuccess();
                     handleClear();
                 }, 2000);
            }

        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: error.message || 'Error updating plan' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchId('');
        setStep('search');
        setOriginalPlan(null);
        setVesselContext(null);
        setFormData({
            serviceStartTime: '', serviceEndTime: '',
            numberOfStaff: 0, numberOfCranes: 0,
            author: '', reasonForChange: ''
        });
        setMessage({ type: '', text: '' });
        setWarnings([]);
    };

    const handleNewSearch = () => {
        handleClear();
    };

    // Render Calc
    const currentDuration = calculateCurrentDuration();
    const minLoad = getMinLoad(vesselContext);
    const minUnload = getMinUnload(vesselContext);
    const totalWorkload = minLoad + minUnload;
    
    // Dynamic Validation for UI
    const cranes = Math.max(1, parseInt(formData.numberOfCranes) || 1);
    const minTotalRequired = Math.ceil(totalWorkload / cranes);
    const isDurationValid = totalWorkload === 0 || currentDuration >= (minTotalRequired - 1);

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Update Operation Plan</h4>
                <p>Search for a plan by ID to make adjustments.</p>
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
                            <label htmlFor="searchId">Plan ID</label>
                            <input type="text" id="searchId" value={searchId} onChange={handleSearchChange} placeholder="e.g., 898b397a-bd0d..." className="form-input" />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>{isLoading ? <span className="loading-spinner"></span> : <span>🔍</span>} Search Plan</button>
                    </div>
                </form>
            )}

            {step === 'edit' && originalPlan && (
                <div className="fade-in">
                    <div className="form-section-header">
                        <h5>Editing Plan: <strong>{originalPlan.scheduleDate || originalPlan.ScheduleDate}</strong></h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}><span style={{ marginRight: '4px' }}>🔍</span>Search different plan</button>
                    </div>

                    {/* --- CONSTRAINTS INFO BOX (DARK MODE FRIENDLY) --- */}
                    <div className="context-info-box" style={{ 
                        marginBottom: '20px', 
                        padding: '15px', 
                        backgroundColor: '#e3f2fd', 
                        color: '#0d47a1', 
                        borderRadius: '6px', 
                        borderLeft: '4px solid #2196F3' 
                    }}>
                        <strong className="context-title" style={{color: '#1565c0', display: 'block', marginBottom: '10px', fontSize: '1.1em'}}>
                            ℹ️ Workload Constraints (Total Effort):
                        </strong>
                        <div className="context-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div>
                                <span style={{ fontSize: '0.9em', color: '#455a64', fontWeight: '500' }}>Unload Work:</span><br/>
                                <strong style={{ fontSize: '1.2em', color: '#000' }}>{minUnload} min</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.9em', color: '#455a64', fontWeight: '500' }}>Load Work:</span><br/>
                                <strong style={{ fontSize: '1.2em', color: '#000' }}>{minLoad} min</strong>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.9em', color: '#455a64', fontWeight: '500' }}>Total Workload:</span><br/>
                                <strong style={{ fontSize: '1.2em', color: '#000' }}>{totalWorkload} min</strong>
                            </div>
                        </div>
                        {totalWorkload === 0 && (
                            <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#d32f2f' }}>
                                ⚠️ <strong>Note:</strong> Constraints are 0. Data not found.
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleUpdate} className="dock-form">
                        <div className="form-divider-label">Schedule & Timing</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Start Time <span className="required">*</span></label>
                                <input type="datetime-local" name="serviceStartTime" value={formData.serviceStartTime} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label>End Time <span className="required">*</span></label>
                                <input type="datetime-local" name="serviceEndTime" value={formData.serviceEndTime} onChange={handleInputChange} className="form-input" required />
                            </div>
                        </div>

                        {/* --- CRANE-AWARE VALIDATION BOX (DARK MODE FRIENDLY) --- */}
                        <div style={{ 
                            marginBottom: '20px', 
                            padding: '12px', 
                            borderRadius: '4px', 
                            backgroundColor: isDurationValid ? '#f1f8e9' : '#ffebee', 
                            border: `1px solid ${isDurationValid ? '#c5e1a5' : '#ef9a9a'}`, 
                            color: '#000', 
                            fontSize: '0.95rem' 
                        }}>
                            {isDurationValid ? (
                                <span style={{ color: '#2e7d32', fontWeight: '600' }}>
                                    ✅ Selected Duration: <strong>{currentDuration} min</strong> (Valid with {cranes} crane{cranes > 1 ? 's' : ''}, min required: {minTotalRequired} min)
                                </span>
                            ) : (
                                <span style={{ color: '#c62828', fontWeight: '600' }}>
                                    ❌ Selected Duration: <strong>{currentDuration} min</strong> (Too short! With {cranes} crane{cranes > 1 ? 's' : ''}, you need at least {minTotalRequired} min)
                                </span>
                            )}
                        </div>

                        <div className="form-divider-label">Resources Allocation</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Number of Staff <span className="required">*</span></label>
                                <input type="number" name="numberOfStaff" value={formData.numberOfStaff} onChange={handleInputChange} className="form-input" min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Number of Cranes <span className="required">*</span></label>
                                <input type="number" name="numberOfCranes" value={formData.numberOfCranes} onChange={handleInputChange} className="form-input" min="1" required />
                            </div>
                        </div>

                        <div className="form-divider-label">Audit Log (Required)</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Author <span className="required">*</span></label>
                                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="form-input" placeholder="Enter your name" required />
                            </div>
                            <div className="form-group">
                                <label>Reason for Change <span className="required">*</span></label>
                                <textarea name="reasonForChange" value={formData.reasonForChange} onChange={handleInputChange} className="form-input" rows="1" placeholder="e.g., Delay due to weather" required />
                            </div>
                        </div>

                        {warnings.length > 0 && (
                            <div className="conflict-warning-box">
                                <strong className="conflict-title">⚠️ Resource Conflicts Detected</strong>
                                <ul className="conflict-list">{warnings.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating || !isDurationValid}>{isUpdating ? <><span className="loading-spinner"></span> Updating...</> : <><span>💾</span> Save Changes</>}</button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}><span>🧹</span> Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};