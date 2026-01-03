const CreateTaskCategoryForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        code: '',
        name: '',
        description: '',
        defaultDuration: 0,
        expectedImpact: 'Parallel'
    });
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.createCategory(formData);
            setMessage({ type: 'success', text: 'Category created successfully!' });
            setFormData({ code: '', name: '', description: '', defaultDuration: 0, expectedImpact: 'Parallel' });
            if (onSuccess) onSuccess();
        } catch (error) {
            const serverMsg = error.response?.data || error.message || 'Create failed.';
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #17a2b8' }}>
            <div className="form-header">
                <h4 style={{ color: '#17a2b8' }}>Define New Category</h4>
                <p>Add a new entry to the task catalog.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Code (Unique) <span className="required">*</span></label>
                        <input name="code" value={formData.code} onChange={handleChange} className="form-input" placeholder="e.g. CTC-01" required />
                    </div>
                    <div className="form-group">
                        <label>Name <span className="required">*</span></label>
                        <input name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="e.g. Hull Inspection" required />
                    </div>
                    <div className="form-group">
                        <label>Expected Impact <span className="required">*</span></label>
                        <select name="expectedImpact" value={formData.expectedImpact} onChange={handleChange} className="form-input">
                            <option value="Parallel">Parallel (No Delay)</option>
                            <option value="Suspension">Suspension (Stops Operations)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Default Duration (min)</label>
                        <input type="number" name="defaultDuration" value={formData.defaultDuration} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="form-input" rows="2" />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#17a2b8'}}>
                        {loading ? 'Creating...' : '💾 Create Definition'}
                    </button>
                </div>
            </form>
        </div>
    );
};