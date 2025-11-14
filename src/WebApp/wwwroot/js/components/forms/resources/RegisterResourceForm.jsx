// Register Resource Form Component
console.log('📝 RegisterResourceForm component loading...');

const RegisterResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        id: '',
        description: '',
        resourceType: '',
        operationalCapacity: '',
        setupTime: '',
        qualificationRequirements: []
    });
    const [qualifications, setQualifications] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    // Resource type options
    const resourceTypes = [
        { value: 'STSCrane', label: 'STS Crane' },
        { value: 'YardCrane', label: 'Yard Crane' },
        { value: 'Truck', label: 'Truck' },
        { value: 'Tractor', label: 'Tractor' }
    ];

    // Load qualifications on mount
    React.useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        try {
            const data = await apiService.getQualifications();
            setQualifications(data || []);
        } catch (error) {
            console.error('Error loading qualifications:', error);
            setMessage({ type: 'error', text: 'Failed to load qualifications' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleQualificationToggle = (qualificationId) => {
        setFormData(prev => {
            const isCurrentlySelected = prev.qualificationRequirements.includes(qualificationId);
            const newRequirements = isCurrentlySelected
                ? prev.qualificationRequirements.filter(id => id !== qualificationId)
                : [...prev.qualificationRequirements, qualificationId];
                
            return {
                ...prev,
                qualificationRequirements: newRequirements
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!formData.id?.trim() || !formData.description?.trim() || !formData.resourceType ||
                !formData.operationalCapacity?.toString().trim() || !formData.setupTime?.toString().trim()) {
                throw new Error('All fields are required');
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.operationalCapacity)) || parseInt(formData.operationalCapacity) <= 0) {
                throw new Error('Operational capacity must be a valid positive number');
            }
            if (isNaN(parseInt(formData.setupTime)) || parseInt(formData.setupTime) < 0) {
                throw new Error('Setup time must be a valid number (0 or greater)');
            }

            // Transform data to match backend DTO expectations
            const resourceData = {
                Id: formData.id,
                Description: formData.description,
                ResourceType: parseInt(formData.resourceType), // Backend expects enum as int
                OperationalCapacity: parseInt(formData.operationalCapacity),
                SetupTime: parseInt(formData.setupTime),
                QualificationRequirements: formData.qualificationRequirements.map(qCode => {
                    const qual = qualifications.find(q => q.code === qCode);
                    return qual ? { Code: qual.code, Name: qual.name } : null;
                }).filter(q => q !== null)
            };

            console.log('🔍 Sending resource data:', resourceData);
            console.log('🔍 Selected qualifications:', formData.qualificationRequirements);
            console.log('🔍 Mapped qualifications:', resourceData.QualificationRequirements);

            // Create resource
            await apiService.createResource(resourceData);
            
            setMessage({ type: 'success', text: 'Resource registered successfully!' });
            
            // Reset form
            setFormData({
                id: '',
                description: '',
                resourceType: '',
                operationalCapacity: '',
                setupTime: '',
                qualificationRequirements: []
            });

            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error registering resource:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to register resource' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            id: '',
            description: '',
            resourceType: '',
            operationalCapacity: '',
            setupTime: '',
            qualificationRequirements: []
        });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Register New Resource</h4>
                <p>Add a new resource to the port management system</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="resource-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="id">
                            Resource ID <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            placeholder="Enter unique resource ID"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Unique identifier for the resource</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Description <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter resource description"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Brief description of the resource</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="resourceType">
                            Resource Type <span className="required">*</span>
                        </label>
                        <select
                            id="resourceType"
                            name="resourceType"
                            value={formData.resourceType}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="">Select resource type</option>
                            {resourceTypes.map((type, index) => (
                                <option key={type.value} value={index}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <small className="form-help">Type/category of the resource</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="operationalCapacity">
                            Operational Capacity <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="operationalCapacity"
                            name="operationalCapacity"
                            value={formData.operationalCapacity}
                            onChange={handleInputChange}
                            placeholder="Enter capacity"
                            min="1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Maximum operational capacity</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="setupTime">
                            Setup Time (minutes) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="setupTime"
                            name="setupTime"
                            value={formData.setupTime}
                            onChange={handleInputChange}
                            placeholder="Enter setup time"
                            min="0"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Time required to set up the resource</small>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="qualificationRequirements">
                            Required Qualifications
                        </label>
                        <div className="qualification-selector">
                            {qualifications.map(qualification => (
                                <div 
                                    key={qualification.code} 
                                    className={`qualification-option ${formData.qualificationRequirements.includes(qualification.code) ? 'selected' : ''}`}
                                    onClick={() => handleQualificationToggle(qualification.code)}
                                >
                                    <span className="qualification-name">{qualification.name}</span>
                                    <span className="qualification-code">({qualification.code})</span>
                                    {formData.qualificationRequirements.includes(qualification.code) && (
                                        <span className="selected-indicator">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <small className="form-help">Click on qualifications to select/deselect them (optional)</small>
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
                                Loading...
                            </>
                        ) : (
                            <>
                                <span>🏗️</span>
                                Register Resource
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="clear-btn"
                    >
                        Clear Form
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterResourceForm component loaded! 📝');