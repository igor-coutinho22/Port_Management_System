const CreateVesselVisitExecutionForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        vesselVisitId: '',
        vesselIMO: '',
        actualArrivalTime: ''
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
        // Clear errors when user types
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

        setLoading(true);

        try {
            // 2. Prepare Payload
            // We format the date to ISO string for the backend DateTime binder
            const payload = {
                vesselVisitId: formData.vesselVisitId.trim(),
                vesselIMO: formData.vesselIMO.trim(),
                actualArrivalTime: new Date(formData.actualArrivalTime).toISOString()
                // CreatedBy is handled by the backend controller (User.Identity.Name)
            };

            // 3. API Call
            await apiService.createVesselVisitExecution(payload);

            // 4. Success Handling
            setMessage({ type: 'success', text: 'Vessel Visit Execution created successfully!' });
            
            // Clear form
            setFormData({
                vesselVisitId: '',
                vesselIMO: '',
                actualArrivalTime: ''
            });

            // Refresh parent list if callback provided
            if (onSuccess) {
                setTimeout(onSuccess, 1500);
            }

        } catch (error) {
            console.error('Create Execution error:', error);
            // Display friendly error message from backend (e.g., "IMO does not match")
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
                        <small style={{ color: '#888', fontSize: '0.8em' }}>
                            Must match the IMO in the notification.
                        </small>
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