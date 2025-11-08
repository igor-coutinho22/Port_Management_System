// Register Vessel Form Component
console.log('📝 RegisterVesselForm component loading...');

const RegisterVesselForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        imo: '',
        vesselName: '',
        operatorName: '',
        vesselTypeName: '',
        requiredCraneCount: '',
        requiredDockLength: '',
        bays: '',
        rows: '',
        tiers: ''
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
            if (!formData.imo?.trim() || !formData.vesselName?.trim() || !formData.operatorName?.trim() || !formData.vesselTypeName?.trim() ||
                !formData.requiredCraneCount?.toString().trim() || !formData.requiredDockLength?.toString().trim() || 
                !formData.bays?.toString().trim() || !formData.rows?.toString().trim() || !formData.tiers?.toString().trim()) {
                throw new Error(t('vessels.forms.register.error.required'));
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.requiredCraneCount)) || parseInt(formData.requiredCraneCount) < 0) {
                throw new Error('Required crane count must be a valid number');
            }
            if (isNaN(parseFloat(formData.requiredDockLength)) || parseFloat(formData.requiredDockLength) <= 0) {
                throw new Error('Required dock length must be a valid positive number');
            }
            if (isNaN(parseInt(formData.bays)) || parseInt(formData.bays) <= 0) {
                throw new Error('Bays must be a valid positive number');
            }
            if (isNaN(parseInt(formData.rows)) || parseInt(formData.rows) <= 0) {
                throw new Error('Rows must be a valid positive number');
            }
            if (isNaN(parseInt(formData.tiers)) || parseInt(formData.tiers) <= 0) {
                throw new Error('Tiers must be a valid positive number');
            }

            // Debug: Log the data being sent
            console.log('🔍 Sending vessel data:', formData);
            console.log('🔍 Data type:', typeof formData);
            console.log('🔍 Data JSON:', JSON.stringify(formData));

            // Transform data to match backend DTO expectations (PascalCase)
            const vesselData = {
                IMO: formData.imo,
                VesselName: formData.vesselName,
                OperatorName: formData.operatorName,
                vesselTypeName: formData.vesselTypeName, // This will be sent as query parameter
                RequiredCraneCount: parseInt(formData.requiredCraneCount),
                RequiredDockLength: parseFloat(formData.requiredDockLength),
                Bays: parseInt(formData.bays),
                Rows: parseInt(formData.rows),
                Tiers: parseInt(formData.tiers)
            };

            console.log('🔍 Transformed vessel data:', vesselData);

            // Create vessel
            await apiService.createVessel(vesselData);
            
            setMessage({ type: 'success', text: t('vessels.forms.register.success') });
            
            // Reset form
            setFormData({
                imo: '',
                vesselName: '',
                operatorName: '',
                vesselTypeName: '',
                requiredCraneCount: '',
                requiredDockLength: '',
                bays: '',
                rows: '',
                tiers: ''
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
                            placeholder={t('vessels.forms.register.imo.placeholder')}
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
                            placeholder={t('vessels.forms.register.name.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.name.help')}</small>
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
                            placeholder={t('vessels.forms.register.operator.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.operator.help')}</small>
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
                        <small className="form-help">{t('vessels.forms.register.type.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requiredCraneCount">
                            {t('vessels.forms.register.crane_count.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="requiredCraneCount"
                            name="requiredCraneCount"
                            value={formData.requiredCraneCount}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.register.crane_count.placeholder')}
                            min="0"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.crane_count.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="requiredDockLength">
                            {t('vessels.forms.register.dock_length.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="requiredDockLength"
                            name="requiredDockLength"
                            value={formData.requiredDockLength}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.register.dock_length.placeholder')}
                            min="0"
                            step="0.1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.dock_length.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bays">
                            {t('vessels.forms.register.bays.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="bays"
                            name="bays"
                            value={formData.bays}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.register.bays.placeholder')}
                            min="1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.bays.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rows">
                            {t('vessels.forms.register.rows.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="rows"
                            name="rows"
                            value={formData.rows}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.register.rows.placeholder')}
                            min="1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.rows.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tiers">
                            {t('vessels.forms.register.tiers.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="tiers"
                            name="tiers"
                            value={formData.tiers}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.register.tiers.placeholder')}
                            min="1"
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('vessels.forms.register.tiers.help')}</small>
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

/* -- IGNORE --- */
/* -- User Input → React State → Form Validation → Data Transform → 
API Service → HTTP Request → Backend Controller → Business Logic → 
Repository → Database → SQL INSERT → Response Back → 
HTTP Response → API Service → React State Update → UI Update --- */