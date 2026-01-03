const UpdateTaskCategoryForm = ({ onSuccess }) => {
    const [searchId, setSearchId] = React.useState('');
    const [step, setStep] = React.useState('search'); // 'search' | 'edit'
    
    const [originalData, setOriginalData] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        defaultDuration: 0,
        expectedImpact: ''
    });

    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter a Category ID.' });
            setLoading(false);
            return;
        }

        try {
            const data = await apiService.getCategoryById(searchId.trim());
            
            if (data) {
                setOriginalData(data);
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    defaultDuration: data.defaultDuration || 0,
                    expectedImpact: data.expectedImpact
                });
                setStep('edit');
                setMessage({ type: 'success', text: 'Category found.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Category not found.');
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
            await apiService.updateCategory(originalData.id, formData);
            
            setMessage({ type: 'success', text: 'Category updated successfully!' });
            
            if (onSuccess) onSuccess();
            
            // Return to search after short delay
            setTimeout(() => {
                handleClear();
            }, 1500);

        } catch (error) {
            console.error('Update error:', error);
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to update category.');
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
        <div className="form-container" style={{ borderTop: '4px solid #fd7e14' }}>
            <div className="form-header">
                <h4 style={{ color: '#fd7e14' }}>Update Definitions</h4>
                <p>Modify task parameters (Name, Duration, Impact). Code cannot be changed.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label>Category ID</label>
                        <input 
                            type="text" 
                            value={searchId} 
                            onChange={(e) => setSearchId(e.target.value)} 
                            className="form-input" 
                            placeholder="e.g. 64b..." 
                        />
                    </div>
                    <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#fd7e14'}}>
                        {loading ? 'Searching...' : '🔍 Find Category'}
                    </button>
                </form>
            )}

            {step === 'edit' && originalData && (
                <form onSubmit={handleUpdate} className="fade-in">
                    
                    {/* Read-Only Context Info */}
                    <div className="context-info-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong>Code:</strong> 
                            <span className="monospace-input" style={{ fontSize: '1.2em' }}>
                                {originalData.code}
                            </span>
                             (Immutable)
                        </div>
                        <div style={{ marginTop: '5px', fontSize: '0.85em', opacity: 0.8 }}>
                            ID: {originalData.id}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Name <span className="required">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Impact <span className="required">*</span></label>
                            <select
                                value={formData.expectedImpact}
                                onChange={(e) => setFormData({...formData, expectedImpact: e.target.value})}
                                className="form-input"
                            >
                                <option value="Parallel">Parallel (No Delay)</option>
                                <option value="Suspension">Suspension (Stops Operations)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Default Duration (min)</label>
                            <input
                                type="number"
                                value={formData.defaultDuration}
                                onChange={(e) => setFormData({...formData, defaultDuration: e.target.value})}
                                className="form-input"
                                min="0"
                            />
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
                        <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#fd7e14'}}>
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