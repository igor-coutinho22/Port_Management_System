const CreateIncidentForm = ({ onSuccess }) => {
    // --- STATE ---
    const [incidentTypes, setIncidentTypes] = React.useState([]);
    const [activeVisits, setActiveVisits] = React.useState([]);
    
    const [formData, setFormData] = React.useState({
        incidentTypeId: '',
        startTime: '',
        description: '',
        severity: 'Minor',
        affectedVesselVisitIds: [] // We handle this as a single select for simplicity, but backend takes an array
    });

    const [loading, setLoading] = React.useState(false);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- LOAD DROPDOWN DATA ---
    React.useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Types (The Menu)
                const types = await apiService.getAllIncidentTypes();
                setIncidentTypes(types || []);

                // 2. Get Active Visits (The Targets)
                // We fetch all executions and filter for those NOT completed
                const visits = await apiService.getVesselVisitExecutions(); 
                const active = (visits || []).filter(v => v.status !== 'Completed');
                setActiveVisits(active);

            } catch (err) {
                console.error("Failed to load form data", err);
                setMessage({ type: 'error', text: 'Failed to load types or vessels. Please refresh.' });
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, []);

    // --- HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleVesselChange = (e) => {
        // The backend expects an Array of IDs, but our simple UI allows picking one vessel.
        const value = e.target.value;
        setFormData({ 
            ...formData, 
            affectedVesselVisitIds: value ? [value] : [] 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.incidentTypeId) {
            setMessage({ type: 'error', text: 'Please select an Incident Type.' });
            return;
        }
        if (!formData.startTime) {
            setMessage({ type: 'error', text: 'Start Time is required.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Send to Backend
            await apiService.createIncident(formData);
            
            setMessage({ type: 'success', text: 'Incident Reported Successfully!' });
            
            // Reset crucial fields, keep context if needed
            setFormData({
                ...formData,
                description: '',
                affectedVesselVisitIds: [],
                startTime: '' 
            });

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Create error:', error);
            
            // Use Controller Message
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to report incident.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="form-container">Loading form options...</div>;
    }

    return (
        <div className="form-container" style={{ borderTop: '4px solid #27ae60' }}>
            <div className="form-header">
                <h4 style={{ color: '#27ae60' }}>Report New Incident</h4>
                <p>Log an operational disruption. This will immediately alert the dashboard.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    
                    {/* 1. Incident Type (Dropdown) */}
                    <div className="form-group">
                        <label>Incident Type <span className="required">*</span></label>
                        <select
                            name="incidentTypeId"
                            value={formData.incidentTypeId}
                            onChange={handleChange}
                            className="form-input"
                            required
                        >
                            <option value="">-- Select Type --</option>
                            {incidentTypes.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.code} - {t.name}
                                </option>
                            ))}
                        </select>
                        <small className="hint-text">Select the standard classification code.</small>
                    </div>

                    {/* 2. Start Time */}
                    <div className="form-group">
                        <label>Start Time <span className="required">*</span></label>
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>

                    {/* 3. Affected Vessel (Optional but recommended) */}
                    <div className="form-group">
                        <label>Affected Vessel (Optional)</label>
                        <select
                            name="affectedVesselVisitIds"
                            onChange={handleVesselChange}
                            className="form-input"
                            value={formData.affectedVesselVisitIds[0] || ''}
                        >
                            <option value="">-- Global / No Specific Vessel --</option>
                            {activeVisits.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.vesselIMO} - {v.status}
                                </option>
                            ))}
                        </select>
                        <small className="hint-text">Link this incident to an active vessel operation.</small>
                    </div>

                    {/* 4. Severity Override (Optional, defaults to Minor) */}
                    <div className="form-group">
                        <label>Current Severity</label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="Minor">Minor</option>
                            <option value="Major">Major</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>

                    {/* 5. Description */}
                    <div className="form-group full-width">
                        <label>Description / Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the impact, cause, or specific location..."
                            className="form-input"
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-danger-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Reporting...' : '🚨 Report Incident'}
                    </button>
                </div>
            </form>
        </div>
    );
};