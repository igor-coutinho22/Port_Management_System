// Register Dock Form Component
console.log('📝 RegisterDockForm component loading...');

export default function RegisterDockForm({ onSuccess }) {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        name: '',
        location: '',
        lengthMeters: '',
        depthMeters: '',
        maxDraftMeters: '',
        allowedVesselTypes: []
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
            setMessage({ type: 'error', text: t('docks.forms.register.error.load_types') });
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

    const handleVesselTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            allowedVesselTypes: checked 
                ? [...prev.allowedVesselTypes, value]
                : prev.allowedVesselTypes.filter(type => type !== value)
        }));
        // Clear messages when user makes changes
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!formData.name?.trim()) {
                throw new Error(t('docks.forms.register.error.required.name'));
            }
            if (!formData.location?.trim()) {
                throw new Error(t('docks.forms.register.error.required.location'));
            }
            if (!formData.lengthMeters?.toString().trim()) {
                throw new Error(t('docks.forms.register.error.required.length'));
            }
            if (!formData.depthMeters?.toString().trim()) {
                throw new Error(t('docks.forms.register.error.required.depth'));
            }
            if (!formData.maxDraftMeters?.toString().trim()) {
                throw new Error(t('docks.forms.register.error.required.draft'));
            }
            if (!formData.allowedVesselTypes || formData.allowedVesselTypes.length === 0) {
                throw new Error(t('docks.forms.register.error.required.vessel_types'));
            }

            // Validate numeric fields
            if (isNaN(parseFloat(formData.lengthMeters)) || parseFloat(formData.lengthMeters) <= 0) {
                throw new Error(t('docks.forms.register.error.length_invalid'));
            }
            if (isNaN(parseFloat(formData.depthMeters)) || parseFloat(formData.depthMeters) <= 0) {
                throw new Error(t('docks.forms.register.error.depth_invalid'));
            }
            if (isNaN(parseFloat(formData.maxDraftMeters)) || parseFloat(formData.maxDraftMeters) <= 0) {
                throw new Error(t('docks.forms.register.error.draft_invalid'));
            }

            // Debug: Log the data being sent
            console.log('🔍 Sending dock data:', formData);

            // Transform data to match backend DTO expectations
            const dockData = {
                Name: formData.name.trim(),
                Location: formData.location.trim(),
                LengthMeters: parseFloat(formData.lengthMeters),
                DepthMeters: parseFloat(formData.depthMeters),
                MaxDraftMeters: parseFloat(formData.maxDraftMeters),
                AllowedVesselTypes: formData.allowedVesselTypes
            };

            console.log('🔍 Transformed dock data:', dockData);

            // Create dock
            await apiService.createDock(dockData);
            
            setMessage({ type: 'success', text: t('docks.forms.register.success') });
            
            // Reset form
            setFormData({
                name: '',
                location: '',
                lengthMeters: '',
                depthMeters: '',
                maxDraftMeters: '',
                allowedVesselTypes: []
            });

            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error registering dock:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('docks.forms.register.error.failed') 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container dock-form">
            <div className="form-header">
                <h4>{t('docks.forms.register.title')}</h4>
                <p>{t('docks.forms.register.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="dock-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">
                            {t('docks.forms.register.name.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.register.name.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('docks.forms.register.name.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">
                            {t('docks.forms.register.location.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.register.location.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('docks.forms.register.location.help')}</small>
                    </div>
                </div>

                {/* Dock Dimensions */}
                <div className="dock-dimensions-grid">
                    <div className="form-group">
                        <label htmlFor="lengthMeters">
                            {t('docks.forms.register.length.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="lengthMeters"
                            name="lengthMeters"
                            value={formData.lengthMeters}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.register.length.placeholder')}
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">{t('docks.forms.register.length.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="depthMeters">
                            {t('docks.forms.register.depth.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="depthMeters"
                            name="depthMeters"
                            value={formData.depthMeters}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.register.depth.placeholder')}
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">{t('docks.forms.register.depth.help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxDraftMeters">
                            {t('docks.forms.register.draft.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="maxDraftMeters"
                            name="maxDraftMeters"
                            value={formData.maxDraftMeters}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.register.draft.placeholder')}
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">{t('docks.forms.register.draft.help')}</small>
                    </div>
                </div>

                {/* Vessel Types Selection */}
                <div className="vessel-types-selection">
                    <div className="selection-header">
                        <h5>{t('docks.forms.register.vessel_types.section_title')} <span className="required">*</span></h5>
                        <p>{t('docks.forms.register.vessel_types.section_desc')}</p>
                    </div>
                    
                    {vesselTypes.length === 0 ? (
                        <div className="loading">{t('docks.forms.register.vessel_types.loading')}</div>
                    ) : (
                        <div className="vessel-types-checkboxes">
                            {vesselTypes.map((vesselType) => (
                                <div key={vesselType.name} className="vessel-type-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`vesselType-${vesselType.name}`}
                                        value={vesselType.name}
                                        checked={formData.allowedVesselTypes.includes(vesselType.name)}
                                        onChange={handleVesselTypeChange}
                                    />
                                    <label htmlFor={`vesselType-${vesselType.name}`}>
                                        <strong>{vesselType.name}</strong>
                                        {vesselType.description && (
                                            <span> - {vesselType.description}</span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
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
                                <span>⚓</span>
                                {t('docks.forms.register.submit')}
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={() => {
                            setFormData({
                                name: '',
                                location: '',
                                lengthMeters: '',
                                depthMeters: '',
                                maxDraftMeters: '',
                                allowedVesselTypes: []
                            });
                            setMessage({ type: '', text: '' });
                        }}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        {t('docks.forms.register.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

console.log('RegisterDockForm component loaded! 📝');