console.log('UpdateVesselVisitExecutionForm component loading...');

const UpdateVesselVisitExecutionForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'edit'
    
    // Data
    const [originalVVE, setOriginalVVE] = React.useState(null);
    const [plannedOps, setPlannedOps] = React.useState([]);
    
    // Form States
    // 1. Header Form (Berth/Dock)
    const [headerFormData, setHeaderFormData] = React.useState({
        berthTime: '',
        dockId: '',
        author: ''
    });

    // 2. Operation Form (Specific Op)
    const [editingOpId, setEditingOpId] = React.useState(null);
    const [opFormData, setOpFormData] = React.useState({
        status: 'Pending',
        staff: 0,
        cranes: 0,
        startTime: '',
        endTime: ''
    });

    // UI
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HELPERS ---
    const formatForInput = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const offset = date.getTimezoneOffset() * 60000;
            return (new Date(date - offset)).toISOString().slice(0, 16);
        } catch (e) { return ''; }
    };

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) { setMessage({ type: 'error', text: 'Execution ID required' }); return; }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Parallel Fetch: VVE Data + Planned Operations
            const [vveData, opsData] = await Promise.all([
                apiService.getVesselVisitExecutionById(searchId.trim()),
                apiService.getPlannedOperations(searchId.trim()).catch(err => [])
            ]);

            if (vveData) {
                setOriginalVVE(vveData);
                setPlannedOps(opsData || []);

                // Pre-fill Header Form
                const timeToUse = vveData.berthTime || vveData.actualArrivalTime;
                setHeaderFormData({
                    berthTime: formatForInput(timeToUse),
                    dockId: vveData.dockId || '',
                    author: '' 
                });

                setStep('edit');
                setMessage({ type: 'success', text: 'Execution data loaded.' });
            } else {
                setMessage({ type: 'info', text: 'Execution not found.' });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage({ type: 'error', text: 'Error loading data.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Update VVE Header (Dock/Berth)
    const handleUpdateHeader = async (e) => {
        e.preventDefault();
        await submitUpdate({
            berthTime: new Date(headerFormData.berthTime).toISOString(),
            dockId: headerFormData.dockId ? headerFormData.dockId.trim() : null,
            author: headerFormData.author
        }, "Header updated successfully.");
    };

    // Update Specific Operation
    const handleUpdateOperation = async (e) => {
        e.preventDefault();
        
        // Find operation type name for log
        const opName = plannedOps.find(p => p.id === editingOpId)?.type || 'Operation';

        const payload = {
            operationId: editingOpId,
            operationType: opName, // Send type for backend logging
            status: opFormData.status,
            staff: parseInt(opFormData.staff),
            cranes: parseInt(opFormData.cranes),
            author: headerFormData.author || 'Operator', // Reuse author field
            
            // Only send dates if they have values
            ...(opFormData.startTime && { actualStartTime: new Date(opFormData.startTime).toISOString() }),
            ...(opFormData.endTime && { actualEndTime: new Date(opFormData.endTime).toISOString() })
        };

        await submitUpdate(payload, "Operation updated successfully.");
        setEditingOpId(null); // Close edit mode
    };

    // Unified Submit Logic
    const submitUpdate = async (payload, successMsg) => {
        setIsUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await apiService.updateVesselVisitExecution(originalVVE.id, payload);
            
            // Update local state to reflect changes immediately
            setOriginalVVE(response); 
            
            if (response.latestDiscrepancy) {
                setMessage({ type: 'warning', text: `Saved with warning: ${response.latestDiscrepancy}` });
            } else {
                setMessage({ type: 'success', text: successMsg });
            }
            if (onSuccess) setTimeout(onSuccess, 1500);
        } catch (error) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: error.message || 'Update failed.' });
        } finally {
            setIsUpdating(false);
        }
    };

    // Prepare Operation for Editing
    const startEditOp = (op) => {
        // Check if we already have execution data for this op
        const existingExec = originalVVE.executedOperations?.find(e => e.operationId === op.id);

        setEditingOpId(op.id);
        setOpFormData({
            status: existingExec ? existingExec.status : 'Pending',
            staff: existingExec ? existingExec.resourcesUsed?.staff : 0,
            cranes: existingExec ? existingExec.resourcesUsed?.cranes : 0,
            startTime: existingExec ? formatForInput(existingExec.actualStartTime) : '',
            endTime: existingExec ? formatForInput(existingExec.actualEndTime) : ''
        });
    };

    const handleClear = () => {
        setSearchId('');
        setStep('search');
        setOriginalVVE(null);
        setPlannedOps([]);
        setEditingOpId(null);
        setMessage({ type: '', text: '' });
    };

    // --- RENDER HELPERS ---
    
    // Check dock changes
    const isDockChanged = originalVVE && headerFormData.dockId && originalVVE.dockId && headerFormData.dockId !== originalVVE.dockId;

    // Get status badge class
    const getStatusClass = (status) => {
        if (!status) return 'status-pending';
        return `status-${status.toLowerCase()}`;
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Update Execution & Operations</h4>
                <p>Manage berth assignment and record operation progress.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Execution ID</label>
                            <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="form-input" placeholder="e.g., c00b3ef3..." />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? <span className="loading-spinner"></span> : <span>🔍</span>} Search
                        </button>
                    </div>
                </form>
            )}

            {step === 'edit' && originalVVE && (
                <div className="fade-in">
                    
                    {/* --- HEADER: BERTHING DETAILS --- */}
                    <form onSubmit={handleUpdateHeader} className="dock-form">
                        <div className="form-divider-label">1. Berthing Details</div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Actual Berth Time</label>
                                <input type="datetime-local" value={headerFormData.berthTime} onChange={(e) => setHeaderFormData({...headerFormData, berthTime: e.target.value})} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label>Assigned Dock ID</label>
                                <input type="text" value={headerFormData.dockId} onChange={(e) => setHeaderFormData({...headerFormData, dockId: e.target.value})} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label>Author <span className="required">*</span></label>
                                <input type="text" value={headerFormData.author} onChange={(e) => setHeaderFormData({...headerFormData, author: e.target.value})} className="form-input" placeholder="Your Name" required />
                            </div>
                        </div>
                        {isDockChanged && <div className="discrepancy-warning-box">⚠️ <strong>Warning:</strong> Changing dock from previous record.</div>}
                        <div className="form-actions" style={{justifyContent: 'flex-start'}}>
                            <button type="submit" className="submit-btn" disabled={isUpdating || editingOpId}>💾 Update Header</button>
                        </div>
                    </form>

                    {/* --- OPERATIONS LIST (US 4.1.9) --- */}
                    <div className="operations-section" style={{marginTop: '30px'}}>
                        <div className="form-divider-label">2. Operations Execution</div>
                        
                        {plannedOps.length === 0 ? (
                            <div className="no-data">No planned operations found for this visit.</div>
                        ) : (
                            <div className="ops-list">
                                {plannedOps.map(op => {
                                    // Get current status from VVE executed array
                                    const execData = originalVVE.executedOperations?.find(e => e.operationId === op.id);
                                    const currentStatus = execData ? execData.status : 'Pending';
                                    const isEditing = editingOpId === op.id;

                                    return (
                                        <div key={op.id} className={`op-card ${isEditing ? 'editing' : ''}`}>
                                            <div className="op-header">
                                                <strong>{op.type}</strong>
                                                <span className={`status-badge ${getStatusClass(currentStatus)}`}>{currentStatus}</span>
                                            </div>
                                            
                                            {!isEditing ? (
                                                <button type="button" className="edit-op-btn" onClick={() => startEditOp(op)}>✏️ Manage</button>
                                            ) : (
                                                <form onSubmit={handleUpdateOperation} className="op-edit-form">
                                                    <div className="form-grid compact">
                                                        <div className="form-group">
                                                            <label>Status</label>
                                                            <select value={opFormData.status} onChange={e => setOpFormData({...opFormData, status: e.target.value})} className="form-input">
                                                                <option value="Pending">Pending</option>
                                                                <option value="Started">Started</option>
                                                                <option value="Completed">Completed</option>
                                                                <option value="Delayed">Delayed</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Start Time</label>
                                                            <input type="datetime-local" value={opFormData.startTime} onChange={e => setOpFormData({...opFormData, startTime: e.target.value})} className="form-input" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>End Time</label>
                                                            <input type="datetime-local" value={opFormData.endTime} onChange={e => setOpFormData({...opFormData, endTime: e.target.value})} className="form-input" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Staff</label>
                                                            <input type="number" value={opFormData.staff} onChange={e => setOpFormData({...opFormData, staff: e.target.value})} className="form-input" />
                                                        </div>
                                                        <div className="form-group">
                                                            <label>Cranes</label>
                                                            <input type="number" value={opFormData.cranes} onChange={e => setOpFormData({...opFormData, cranes: e.target.value})} className="form-input" />
                                                        </div>
                                                    </div>
                                                    <div className="op-actions">
                                                        <button type="submit" className="submit-btn small" disabled={isUpdating}>✔ Save Op</button>
                                                        <button type="button" className="clear-btn small" onClick={() => setEditingOpId(null)}>Cancel</button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{marginTop: '20px', textAlign: 'right'}}>
                        <button type="button" className="clear-btn" onClick={handleClear}>Close Form</button>
                    </div>
                </div>
            )}
        </div>
    );
};