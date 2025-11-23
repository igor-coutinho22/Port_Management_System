// Register Representative Form Component
console.log('RegisterRepresentativesForm is loading...');

const RegisterRepresentativeForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        organizationId: '',
        name: '',
        citizenId: '',
        nationality: '',
        email: '',
        phone: ''
    });
    const [organizations, setOrganizations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    React.useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const orgs = await apiService.getOrganizations();
                setOrganizations(orgs);
            } catch (error) {
                setOrganizations([]);
            }
        };
        fetchOrganizations();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleClear = () => {
        setFormData({ organizationId: '', name: '', citizenId: '', nationality: '', email: '', phone: '' });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.organizationId) {
                throw new Error('Please select an organization.');
            }
            await apiService.createRepresentative(formData.organizationId, {
                name: formData.name,
                citizenId: formData.citizenId,
                nationality: formData.nationality,
                email: formData.email,
                phone: formData.phone
            });
            setMessage({ type: 'success', text: 'Representative registered successfully!' });
            setFormData({ organizationId: '', name: '', citizenId: '', nationality: '', email: '', phone: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error?.message || 'Failed to register representative.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container representative-form">
            <div className="form-header">
                <h4>Register Representative</h4>
                <p>Create a new representative. All fields are required.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="representative-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="organizationId">
                            Organization <span className="required">*</span>
                        </label>
                        <select
                            id="organizationId"
                            name="organizationId"
                            value={formData.organizationId}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="" disabled>Select organization...</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.legalName}</option>
                            ))}
                        </select>
                        <small className="form-help">Choose the organization to assign this representative</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">
                            Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., John Doe"
                            className="form-input"
                            maxLength={120}
                            required
                        />
                        <small className="form-help">Full name of the representative</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="citizenId">
                            Citizen ID <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="citizenId"
                            name="citizenId"
                            value={formData.citizenId}
                            onChange={handleInputChange}
                            placeholder="e.g., 123456789"
                            className="form-input"
                            maxLength={64}
                            required
                        />
                        <small className="form-help">Unique citizen identification number</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="nationality">
                            Nationality <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            placeholder="e.g., PRT"
                            className="form-input"
                            maxLength={3}
                            required
                        />
                        <small className="form-help">ISO 2 or 3-letter country code</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g., john.doe@email.com"
                            className="form-input"
                            maxLength={200}
                            required
                        />
                        <small className="form-help">Valid email address</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">
                            Phone <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., +351912345678"
                            className="form-input"
                            maxLength={32}
                            required
                        />
                        <small className="form-help">Phone number in E.164 format</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Registering...
                            </>
                        ) : (
                            <>
                                <span>👤</span>
                                Register Representative
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        Clear Form
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterRepresentativeForm component loaded!');
