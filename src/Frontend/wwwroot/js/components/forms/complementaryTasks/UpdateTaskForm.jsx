const UpdateTaskForm = ({ onSuccess }) => {
    // --- STATE ---
    const [step, setStep] = React.useState('select'); // 'select' | 'edit'
    const [ongoingTasks, setOngoingTasks] = React.useState([]);
    const [selectedTaskId, setSelectedTaskId] = React.useState('');
    
    // Form Data
    const [originalTask, setOriginalTask] = React.useState(null);
    const [formData, setFormData] = React.useState({
        responsibleTeam: '',
        endTime: '',
        status: ''
    });

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- LOAD ONGOING TASKS (For Quick Select) ---
    React.useEffect(() => {
        if (step === 'select') {
            loadOngoingTasks();
        }
    }, [step]);

    const loadOngoingTasks = async () => {
        setLoading(true);
        try {
            // We search for everything, then filter for 'Ongoing' client-side 
            // (or use backend filter if available: { status: 'Ongoing' })
            const allTasks = await apiService.searchComplementaryTasks({}); 
            
            const active = (allTasks || [])
                .filter(t => t.status === 'Ongoing')
                .sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // Newest first

            setOngoingTasks(active);
        } catch (error) {
            console.error("Failed to load active tasks", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleSelect = async (e) => {
        e.preventDefault();
        if (!selectedTaskId) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const task = await apiService.getTaskById(selectedTaskId);
            
            // --- FIX: Prevent editing completed tasks ---
            if (task.status === 'Completed') {
                setMessage({ 
                    type: 'error', 
                    text: '⚠️ This task is already Completed. You cannot edit history.' 
                });
                setLoading(false);
                return; // Stop here
            }
            // --------------------------------------------

            setOriginalTask(task);
            
            // Pre-fill form
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

            setFormData({
                responsibleTeam: task.responsibleTeam,
                status: task.status,
                endTime: now.toISOString().slice(0, 16)
            });
            
            setStep('edit');
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load task details.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDetails = async () => {
        // Just updates the text fields (Team), NOT the status
        await submitUpdate({ 
            responsibleTeam: formData.responsibleTeam 
        }, 'Details updated.');
    };

    const handleCompleteTask = async () => {
        // Updates Status AND EndTime
        await submitUpdate({
            responsibleTeam: formData.responsibleTeam, // Keep team updates if any
            status: 'Completed',
            endTime: formData.endTime
        }, 'Task marked as Completed!');
    };

    const submitUpdate = async (payload, successText) => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.updateTask(originalTask.id, payload);
            setMessage({ type: 'success', text: successText });
            
            if (onSuccess) onSuccess();

            // Return to selection after short delay
            setTimeout(() => {
                setStep('select');
                setSelectedTaskId('');
                setOriginalTask(null);
                setMessage({ type: '', text: '' });
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Update failed.' });
        } finally {
            setLoading(false);
        }
    };

    // Helper to render Vessel Name safely
    const getVesselName = (t) => {
        // Logic matches the table: prefers Name, falls back to IMO, or checks nested object
        if (t.vesselName) return t.vesselName;
        // If it's a raw object from search (populated)
        if (t.vesselVisitExecutionId && t.vesselVisitExecutionId.vesselIMO) {
             return `IMO: ${t.vesselVisitExecutionId.vesselIMO}`;
        }
        return 'Unknown Vessel';
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #007bff' }}>
            <div className="form-header">
                <h4 style={{ color: '#007bff' }}>Update / Complete Task</h4>
                <p>Modify active operations or mark them as finished.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {/* STEP 1: SELECT TASK */}
            {step === 'select' && (
                <form onSubmit={handleSelect} className="search-form">
                    <div className="form-group full-width">
                        <label>Select Ongoing Operation</label>
                        {loading ? (
                            <div style={{color: '#aaa'}}>Loading active tasks...</div>
                        ) : (
                            <select 
                                value={selectedTaskId} 
                                onChange={(e) => setSelectedTaskId(e.target.value)} 
                                className="form-input"
                                size={5} // Shows as a list box for easier scanning
                                style={{ height: 'auto', overflowY: 'auto' }}
                            >
                                {ongoingTasks.length === 0 && <option disabled>No ongoing tasks found.</option>}
                                {ongoingTasks.map(t => (
                                    <option key={t.id} value={t.id} style={{ padding: '8px' }}>
                                        {/* Format: [Category] on [Vessel] (Start Time) */}
                                        {t.category ? t.category.name : 'Task'} 
                                        {' @ '} 
                                        {getVesselName(t)}
                                        {' — '}
                                        {new Date(t.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </option>
                                ))}
                            </select>
                        )}
                        <small style={{ color: '#666' }}>
                            {ongoingTasks.length} active tasks found. Select one to edit.
                        </small>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn" 
                            disabled={loading || !selectedTaskId}
                            style={{ backgroundColor: '#007bff' }}
                        >
                            Edit Selected Task
                        </button>
                    </div>
                    
                    {/* Fallback: Type ID manually */}
                    <div style={{ marginTop: '15px', borderTop: '1px solid #444', paddingTop: '10px' }}>
                        <details>
                            <summary style={{ cursor: 'pointer', color: '#888', fontSize: '0.9em' }}>Or search by Task ID...</summary>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input 
                                    className="form-input" 
                                    placeholder="Paste ID here..." 
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                />
                                <button onClick={handleSelect} className="submit-btn" style={{ width: 'auto' }}>Go</button>
                            </div>
                        </details>
                    </div>
                </form>
            )}

            {/* STEP 2: EDIT / COMPLETE */}
            {step === 'edit' && originalTask && (
                <div className="fade-in">
                    {/* Context Header */}
                    <div className="context-info-box" style={{ borderLeft: '3px solid #007bff' }}>
                        <strong style={{ fontSize: '1.1em', color: '#fff' }}>
                            {originalTask.category ? originalTask.category.name : 'Operation'}
                        </strong>
                        <div style={{ margin: '5px 0', color: '#ccc' }}>
                            Vessel: <span style={{ color: '#17a2b8' }}>{getVesselName(originalTask)}</span>
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#888' }}>
                            Started: {new Date(originalTask.startTime).toLocaleString()}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Responsible Team</label>
                            <input 
                                value={formData.responsibleTeam} 
                                onChange={(e) => setFormData({...formData, responsibleTeam: e.target.value})} 
                                className="form-input"
                            />
                        </div>

                        {/* Complete Section */}
                        {originalTask.status === 'Ongoing' && (
                            <div className="form-group full-width" style={{ 
                                backgroundColor: 'rgba(40, 167, 69, 0.1)', 
                                padding: '15px', 
                                borderRadius: '8px',
                                border: '1px dashed #28a745'
                            }}>
                                <label style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Completion Details</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '5px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.8em' }}>End Time</label>
                                        <input 
                                            type="datetime-local"
                                            value={formData.endTime}
                                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                            className="form-input"
                                        />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                         <small style={{ color: '#aaa', fontStyle: 'italic' }}>
                                             Duration will be calculated automatically.
                                         </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <button 
                                onClick={() => setStep('select')} 
                                className="delete-cancel-btn"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={handleUpdateDetails} 
                                className="submit-btn" 
                                style={{ backgroundColor: '#6c757d' }}
                                disabled={loading}
                            >
                                💾 Save Details Only
                            </button>
                            
                            {originalTask.status === 'Ongoing' && (
                                <button 
                                    onClick={handleCompleteTask} 
                                    className="submit-btn" 
                                    style={{ backgroundColor: '#28a745' }}
                                    disabled={loading}
                                >
                                    ✅ Complete Task
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};