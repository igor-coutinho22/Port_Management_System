const UpdateIncidentTypeForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'edit'
    
    // Data
    const [originalData, setOriginalData] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        severity: 'Minor',
        description: ''
    });

    // UI
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
            const data = await apiService.getIncidentTypeById(searchId.trim());
            
            if (data) {
                setOriginalData(data);
                setFormData({
                    name: data.name,
                    severity: data.severity,
                    description: data.description || ''
                });
                setStep('edit');
                setMessage({ type: 'success', text: 'Incident Type found.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            
            // LOGIC: Use the exact text sent by the Controller
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to retrieve data.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.updateIncidentType(originalData.id, formData);
            
            setMessage({ type: 'success', text: 'Incident Type updated successfully!' });
            
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
        <div className="form-container">
            <div className="form-header">
                <h4>Update Incident Type</h4>
                <p>Modify definition details. Note: The unique Code cannot be changed.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label>Incident Type ID</label>
                        <input 
                            type="text" 
                            value={searchId} 
                            onChange={(e) => setSearchId(e.target.value)} 
                            className="form-input" 
                            placeholder="e.g. 64b..." 
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Searching...' : '🔍 Find Type'}
                    </button>
                </form>
            )}

            {step === 'edit' && originalData && (
                <form onSubmit={handleUpdate} className="fade-in">
                    
                    {/* Read-Only Context Info */}
                    <div className="context-info-box">
                        <strong>Code:</strong> <span className="monospace-input">{originalData.code}</span> <br/>
                        <small>ID: {originalData.id}</small>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Type Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Default Severity <span className="required">*</span></label>
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

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="form-input"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Saving...' : '💾 Save Changes'}
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