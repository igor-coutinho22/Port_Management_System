const CreateVesselVisitExecutionForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        vesselVisitId: '',
        vesselIMO: '',
        actualArrivalTime: '',
        berthTime: '', 
        dockId: ''    
    });

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to validate GUID format
    const isValidGuid = (id) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.type === 'error') setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // 1. Basic Validation
        if (!formData.vesselVisitId.trim()) {
            setMessage({ type: 'error', text: 'Vessel Visit ID is required.' });
            return;
        }
        if (!isValidGuid(formData.vesselVisitId)) {
            setMessage({ type: 'error', text: 'Invalid Vessel Visit ID format (GUID required).' });
            return;
        }
        if (!formData.vesselIMO.trim()) {
            setMessage({ type: 'error', text: 'Vessel IMO is required.' });
            return;
        }
        if (!formData.actualArrivalTime) {
            setMessage({ type: 'error', text: 'Actual Arrival Time is required.' });
            return;
        }
        // Optional validation for Dock ID if user enters one
        if (formData.dockId && !isValidGuid(formData.dockId)) {
            setMessage({ type: 'error', text: 'Invalid Dock ID format (GUID required).' });
            return;
        }

        setLoading(true);

        try {
            // 2. Prepare Payload
            const payload = {
                vesselVisitId: formData.vesselVisitId.trim(),
                vesselIMO: formData.vesselIMO.trim(),
                actualArrivalTime: new Date(formData.actualArrivalTime).toISOString(),
                // Optional fields
                berthTime: formData.berthTime ? new Date(formData.berthTime).toISOString() : null,
                dockId: formData.dockId ? formData.dockId.trim() : null
            };

            // 3. API Call
            const response = await apiService.createVesselVisitExecution(payload);

            // 4. Success Handling
            if (response && response.latestDiscrepancy) {
                setMessage({ 
                    type: 'warning', 
                    text: `Created with warning: ${response.latestDiscrepancy}` 
                });
            } else {
                setMessage({ type: 'success', text: 'Vessel Visit Execution created successfully!' });
            }
            
            // Clear form
            setFormData({
                vesselVisitId: '',
                vesselIMO: '',
                actualArrivalTime: '',
                berthTime: '',
                dockId: ''
            });

            if (onSuccess) {
                setTimeout(onSuccess, 1500);
            }

        } catch (error) {
            console.error('Create Execution error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to start execution.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Start Vessel Visit Execution</h4>
                <p>Record the actual arrival of a vessel to begin operations.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="search-form">
                <div className="form-grid">
                    {/* Vessel Visit ID */}
                    <div className="form-group">
                        <label htmlFor="vesselVisitId">Vessel Visit ID <span className="required">*</span></label>
                        <input
                            type="text"
                            id="vesselVisitId"
                            name="vesselVisitId"
                            value={formData.vesselVisitId}
                            onChange={handleChange}
                            placeholder="e.g., c00b3ef3-3bf2..."
                            className="form-input"
                            required
                        />
                        <small style={{ color: '#888', fontSize: '0.8em' }}>
                            The ID of the approved Vessel Visit Notification.
                        </small>
                    </div>

                    {/* Vessel IMO */}
                    <div className="form-group">
                        <label htmlFor="vesselIMO">Vessel IMO <span className="required">*</span></label>
                        <input
                            type="text"
                            id="vesselIMO"
                            name="vesselIMO"
                            value={formData.vesselIMO}
                            onChange={handleChange}
                            placeholder="e.g., 9876543"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Actual Arrival Time */}
                    <div className="form-group">
                        <label htmlFor="actualArrivalTime">Actual Arrival Time <span className="required">*</span></label>
                        <input
                            type="datetime-local"
                            id="actualArrivalTime"
                            name="actualArrivalTime"
                            value={formData.actualArrivalTime}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>
                </div>

                <div className="form-divider-label">Optional Initial Setup</div>

                <div className="form-grid">
                    {/* Berth Time (Optional) */}
                    <div className="form-group">
                        <label htmlFor="berthTime">Actual Berth Time</label>
                        <input
                            type="datetime-local"
                            id="berthTime"
                            name="berthTime"
                            value={formData.berthTime}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>

                    {/* Dock ID (Optional - Manual Input) */}
                    <div className="form-group">
                        <label htmlFor="dockId">Assigned Dock ID</label>
                        <input
                            type="text"
                            id="dockId"
                            name="dockId"
                            value={formData.dockId}
                            onChange={handleChange}
                            placeholder="e.g., 20c24385-28b9..."
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn success" 
                        disabled={loading}
                    >
                        {loading ? (
                            <><span className="loading-spinner"></span> Processing...</>
                        ) : (
                            <><span>🚀</span> Start Execution</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};