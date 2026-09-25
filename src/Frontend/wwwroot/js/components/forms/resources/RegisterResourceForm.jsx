// Register Resource Form Component

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
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];

    // Resource type options (TRANSLATED LABELS)
    const resourceTypes = [
        { value: 'STSCrane', label: t('resources.type.STS_Crane') },
        { value: 'YardCrane', label: t('resources.type.Yard_Crane') },
        { value: 'Truck', label: t('resources.type.Truck') },
        { value: 'Tractor', label: t('resources.type.Tractor') }
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
            // TRANSLATION APPLIED
            setMessage({ type: 'error', text: t('resources.forms.register.error.load_qualifications') });
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

    const handleQualificationToggle = (qualificationCode) => {
        // LOGIC UNCHANGED
        setFormData(prev => {
            const isCurrentlySelected = prev.qualificationRequirements.includes(qualificationCode);
            const newRequirements = isCurrentlySelected
                ? prev.qualificationRequirements.filter(id => id !== qualificationCode)
                : [...prev.qualificationRequirements, qualificationCode];
                
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
                throw new Error(t('resources.forms.register.error.all_required'));
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.operationalCapacity)) || parseInt(formData.operationalCapacity) <= 0) {
                throw new Error(t('resources.forms.register.error.capacity_invalid'));
            }
            if (isNaN(parseInt(formData.setupTime)) || parseInt(formData.setupTime) < 0) {
                throw new Error(t('resources.forms.register.error.setup_time_invalid'));
            }

            // Transform data to match backend DTO expectations
            const resourceData = {
                Id: formData.id,
                Description: formData.description,
                ResourceType: parseInt(formData.resourceType), // Backend expects enum as int
                OperationalCapacity: parseInt(formData.operationalCapacity),
                SetupTime: parseInt(formData.setupTime),
                QualificationRequirements: formData.qualificationRequirements.map(qCode => {
                    const qual = qualifications.find(q => getAttr(q, 'code') === qCode);
                    // LOGIC UNCHANGED: Map to DTO structure
                    return qual ? { Code: getAttr(qual, 'code'), Name: getAttr(qual, 'name') } : null;
                }).filter(q => q !== null)
            };

            // Create resource
            await apiService.createResource(resourceData);
            
            setMessage({ type: 'success', text: t('resources.forms.register.success') });
            
            // Reset form (LOGIC UNCHANGED)
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
                text: error.message || t('resources.forms.register.error.failed') 
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
                <h4>{t('resources.forms.register.title')}</h4>
                <p>{t('resources.forms.register.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="resource-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="id">
                            {t('resources.forms.register.id.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.register.id.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('resources.forms.register.id.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            {t('resources.forms.register.description.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.register.description.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('resources.forms.register.description.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="resourceType">
                            {t('resources.forms.register.type.label')} <span className="required">*</span>
                        </label>
                        <select
                            id="resourceType"
                            name="resourceType"
                            value={formData.resourceType}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="">{t('resources.forms.register.type.select_placeholder')}</option>
                            {resourceTypes.map((type, index) => (
                                <option key={type.value} value={index}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        <small className="form-help">{t('resources.forms.register.type.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="operationalCapacity">
                            {t('resources.forms.register.capacity.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="operationalCapacity"
                            name="operationalCapacity"
                            value={formData.operationalCapacity}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.register.capacity.placeholder')}
                            min="1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('resources.forms.register.capacity.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="setupTime">
                            {t('resources.forms.register.setup_time.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="setupTime"
                            name="setupTime"
                            value={formData.setupTime}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.register.setup_time.placeholder')}
                            min="0"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('resources.forms.register.setup_time.help')}</small>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="qualificationRequirements">
                            {t('resources.forms.register.qualifications.label')}
                        </label>
                        <div className="qualification-selector">
                            {qualifications.map(qualification => (
                                <div 
                                    key={getAttr(qualification, 'code')} 
                                    className={`qualification-option ${formData.qualificationRequirements.includes(getAttr(qualification, 'code')) ? 'selected' : ''}`}
                                    onClick={() => handleQualificationToggle(getAttr(qualification, 'code'))}
                                >
                                    <span className="qualification-name">{getAttr(qualification, 'name')}</span>
                                    <span className="qualification-code">({getAttr(qualification, 'code')})</span>
                                    {formData.qualificationRequirements.includes(getAttr(qualification, 'code')) && (
                                        <span className="selected-indicator">✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <small className="form-help">{t('resources.forms.register.qualifications.help')}</small>
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
                                {t('resources.forms.register.registering')}
                            </>
                        ) : (
                            <>
                                <span>🏗️</span>
                                {t('resources.forms.register.submit')}
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="clear-btn"
                        disabled={isLoading}
                    >
                        {t('resources.forms.register.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}
