const CreateIncidentTypeForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        code: '',
        severity: 'Minor', // Default
        description: ''
    });

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // UX Improvement: Auto-uppercase the Code field
        if (name === 'code') {
            setFormData({ ...formData, [name]: value.toUpperCase() });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Frontend Validation (mirroring backend logic)
        const codeRegex = /^[A-Z0-9_-]{3,20}$/;
        if (!codeRegex.test(formData.code)) {
            setMessage({ 
                type: 'error', 
                text: 'Invalid Code: Must be 3-20 characters, uppercase letters, numbers, hyphens, or underscores only.' 
            });
            setLoading(false);
            return;
        }

        try {
            await apiService.createIncidentType(formData);
            
            setMessage({ type: 'success', text: 'Incident Type created successfully!' });
            
            // Refresh parent list
            if (onSuccess) onSuccess();

            // Clear form
            setFormData({
                name: '',
                code: '',
                severity: 'Minor',
                description: ''
            });

        } catch (error) {
            console.error('Creation error:', error);
            // Handle 409 Conflict specifically if possible, otherwise generic message
            if (error.response && error.response.status === 409) {
                setMessage({ type: 'error', text: 'Error: An Incident Type with this Code already exists.' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to create incident type.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Define New Incident Type</h4>
                <p>Create a standard classification for operational disruptions.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    
                    {/* Name */}
                    <div className="form-group">
                        <label>Type Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Dense Fog"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Code (Strict Format) */}
                    <div className="form-group">
                        <label>Unique Code <span className="required">*</span></label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g. ENV-01"
                            className="form-input monospace-input" 
                            required
                            maxLength={20}
                        />
                        <small className="hint-text">Format: AAA-000 (Uppercase, No spaces)</small>
                    </div>

                    {/* Severity Dropdown */}
                    <div className="form-group">
                        <label>Default Severity <span className="required">*</span></label>
                        <select
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="Minor">Minor (Routine)</option>
                            <option value="Major">Major (Delays Expected)</option>
                            <option value="Critical">Critical (Stoppage)</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what this incident entails..."
                            className="form-input"
                            rows="3"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Creating...' : '✅ Create Type'}
                    </button>
                </div>
            </form>
        </div>
    );
};