// Register Staff Form Component
console.log('📝 RegisterStaffForm component loading...');

const RegisterStaffForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        mecanographicNumber: '',
        shortName: '',
        email: '',
        phone: '',
        status: 'Available',
        operationalWindow: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Validate required fields
            if (!formData.mecanographicNumber?.trim()) throw new Error('Mecanographic number is required');
            if (!formData.shortName?.trim()) throw new Error('Short name is required');
            if (!formData.email?.trim()) throw new Error('Email is required');
            if (!formData.phone?.trim()) throw new Error('Phone is required');
            if (!formData.operationalWindow?.trim()) throw new Error('Operational window is required');

            // Debug: Log the data being sent
            console.log('🔍 Sending staff data:', formData);

            // Transform data to match backend DTO expectations
            const staffData = {
                MecanographicNumber: formData.mecanographicNumber.trim(),
                ShortName: formData.shortName.trim(),
                Email: formData.email.trim(),
                Phone: formData.phone.trim(),
                Status: formData.status,
                OperationalWindow: formData.operationalWindow.trim()
            };

            await apiService.createStaff(staffData);
            setMessage({ type: 'success', text: 'Staff registered successfully!' });
            setFormData({
                mecanographicNumber: '',
                shortName: '',
                email: '',
                phone: '',
                status: 'Available',
                operationalWindow: ''
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error registering staff:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to register staff' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container staff-form">
            <div className="form-header">
                <h4>Register Staff</h4>
                <p>Create a new staff member with details and operational window</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="mecanographicNumber">Mecanographic Number <span className="required">*</span></label>
                        <input
                            type="text"
                            id="mecanographicNumber"
                            name="mecanographicNumber"
                            value={formData.mecanographicNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., S12345"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Unique staff identifier</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="shortName">Short Name <span className="required">*</span></label>
                        <input
                            type="text"
                            id="shortName"
                            name="shortName"
                            value={formData.shortName}
                            onChange={handleInputChange}
                            placeholder="e.g., John Doe"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Full name or nickname</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email <span className="required">*</span></label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g., john.doe@example.com"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Contact email address</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone <span className="required">*</span></label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., +351912345678"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Contact phone number</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status <span className="required">*</span></label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                        <small className="form-help">Current staff status</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="operationalWindow">Operational Window <span className="required">*</span></label>
                        <input
                            type="text"
                            id="operationalWindow"
                            name="operationalWindow"
                            value={formData.operationalWindow}
                            onChange={handleInputChange}
                            placeholder="e.g., 08:00-16:00"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Working hours or shift</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Registering...</>) : (<>Register Staff</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterStaffForm component loaded!');
