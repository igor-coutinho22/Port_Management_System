// Register Vessel Form Component
console.log('📝 RegisterVesselForm component loading...');

const RegisterVesselForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        imo: '',
        vesselName: '',
        operatorName: '',
        vesselTypeName: ''
    });
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Load vessel types on mount
    React.useEffect(() => {
        loadVesselTypes();
    }, []);

    const loadVesselTypes = async () => {
        try {
            const types = await apiService.getVesselTypes();
            setVesselTypes(types);
        } catch (error) {
            console.error('Error loading vessel types:', error);
            setMessage({ type: 'error', text: t('vessels.forms.register.error.load_types') });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!formData.imo || !formData.vesselName || !formData.operatorName || !formData.vesselTypeName) {
                throw new Error(t('vessels.forms.register.error.required'));
            }

            // Create vessel
            await apiService.createVessel(formData);
            
            setMessage({ type: 'success', text: t('vessels.forms.register.success') });
            
            // Reset form
            setFormData({
                imo: '',
                vesselName: '',
                operatorName: '',
                vesselTypeName: ''
            });

            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error registering vessel:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('vessels.forms.register.error.failed') 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('vessels.forms.register.title')}</h4>
                <p>{t('vessels.forms.register.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="vessel-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="imo">
                            {t('vessels.forms.register.imo.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="imo"
                            name="imo"
                            value={formData.imo}
                            onChange={handleInputChange}
                            placeholder="e.g., IMO1234567"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.imo.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="vesselName">
                            {t('vessels.forms.register.name.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="vesselName"
                            name="vesselName"
                            value={formData.vesselName}
                            onChange={handleInputChange}
                            placeholder="e.g., Atlantic Cargo"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="operatorName">
                            {t('vessels.forms.register.operator.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="operatorName"
                            name="operatorName"
                            value={formData.operatorName}
                            onChange={handleInputChange}
                            placeholder="e.g., Maersk Line"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="vesselTypeName">
                            {t('vessels.forms.register.type.label')} <span className="required">*</span>
                        </label>
                        <select
                            id="vesselTypeName"
                            name="vesselTypeName"
                            value={formData.vesselTypeName}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="">{t('vessels.forms.register.type.placeholder')}</option>
                            {vesselTypes.map((type) => (
                                <option key={type.id} value={type.name}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
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
                                {t('common.loading')}
                            </>
                        ) : (
                            <>
                                <span>🚢</span>
                                {t('vessels.forms.register.submit')}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterVesselForm component loaded! 📝');