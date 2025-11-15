// Register Qualification Form Component
console.log('📝 RegisterQualificationForm component loading...');

const RegisterQualificationForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        code: '',
        name: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.code?.trim()) throw new Error('Qualification code is required');
            if (!formData.name?.trim()) throw new Error('Qualification name is required');

            const qualificationData = {
                Code: formData.code.trim(),
                Name: formData.name.trim()
            };
            await apiService.registerQualification(qualificationData);
            setMessage({ type: 'success', text: 'Qualification registered successfully!' });
            setFormData({ code: '', name: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to register qualification' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container qualification-form">
            <div className="form-header">
                <h4>Register Qualification</h4>
                <p>Create a new qualification with code and name</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type) }}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="qualification-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="code">Qualification Code <span className="required">*</span></label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="e.g., Q-001"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Unique code to identify this qualification</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Qualification Name <span className="required">*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Forklift Operator"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Name/description of the qualification</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Registering...</>) : (<>Register Qualification</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterQualificationForm component loaded!');
