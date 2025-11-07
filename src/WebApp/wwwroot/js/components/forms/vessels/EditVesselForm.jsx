// Edit Vessel Form Component
console.log('✏️ EditVesselForm component loading...');

const EditVesselForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        imo: ''
    });
    const [formData, setFormData] = React.useState({
        imo: '',
        vesselName: '',
        operatorName: '',
        vesselTypeName: ''
    });
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [vessel, setVessel] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

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

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate IMO field
        if (!searchData.imo.trim()) {
            setMessage({ type: 'error', text: t('vessels.forms.get_by_imo.error.required') });
            return;
        }
        
        if (!/^\d{7}$/.test(searchData.imo.trim())) {
            setMessage({ type: 'error', text: t('vessels.forms.get_by_imo.error.format') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setVessel(null);
        
        try {
            const data = await apiService.getVesselByImo(searchData.imo.trim());
            if (data) {
                setVessel(data);
                setFormData({
                    imo: data.imo || '',
                    vesselName: data.vesselName || '',
                    operatorName: data.operatorName || '',
                    vesselTypeName: data.vesselTypeName || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: t('vessels.forms.edit.vessel_found') });
            } else {
                setVessel(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('vessels.forms.get_by_imo.not_found') });
            }
        } catch (error) {
            console.error('Error fetching vessel:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('vessels.forms.get_by_imo.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('vessels.forms.get_by_imo.error.failed') });
            }
            setVessel(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!formData.imo || !formData.vesselName || !formData.operatorName || !formData.vesselTypeName) {
                throw new Error(t('vessels.forms.register.error.required'));
            }

            // Update vessel
            await apiService.updateVessel(formData.imo, formData);
            
            setMessage({ type: 'success', text: t('vessels.forms.edit.success') });
            
            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error updating vessel:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('vessels.forms.edit.error.failed') 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ imo: '' });
        setFormData({
            imo: '',
            vesselName: '',
            operatorName: '',
            vesselTypeName: ''
        });
        setVessel(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ imo: '' });
        setVessel(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

        return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('vessels.forms.edit.title')}</h4>
                <p>{t('vessels.forms.edit.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Step 1: Search for Vessel */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchImo">{t('vessels.forms.get_by_imo.imo.label')}</label>
                            <input
                                type="text"
                                id="searchImo"
                                name="imo"
                                value={searchData.imo}
                                onChange={handleSearchInputChange}
                                placeholder={t('vessels.forms.get_by_imo.placeholder')}
                                maxLength="7"
                                className="form-input"
                            />
                            <small className="form-help">{t('vessels.forms.edit.search_help')}</small>
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
                                    <span>🔍</span>
                                    {t('vessels.forms.edit.search_button')}
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
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Edit Vessel Form */}
            {step === 'edit' && vessel && (
                <>
                    <div className="form-section-header">
                        <h5>{t('vessels.forms.edit.editing_text')} {vessel.vesselName} (IMO: {vessel.imo})</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 {t('vessels.forms.edit.search_different')}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="vessel-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editImo">{t('vessels.forms.register.imo.label')}</label>
                                <input
                                    type="text"
                                    id="editImo"
                                    name="imo"
                                    value={formData.imo}
                                    onChange={handleFormInputChange}
                                    placeholder={t('vessels.forms.register.imo.placeholder')}
                                    maxLength="7"
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">{t('vessels.forms.edit.imo_readonly')}</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editVesselName">{t('vessels.forms.register.name.label')}</label>
                                <input
                                    type="text"
                                    id="editVesselName"
                                    name="vesselName"
                                    value={formData.vesselName}
                                    onChange={handleFormInputChange}
                                    placeholder={t('vessels.forms.register.name.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('vessels.forms.register.name.help')}</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editOperatorName">{t('vessels.forms.register.operator.label')}</label>
                                <input
                                    type="text"
                                    id="editOperatorName"
                                    name="operatorName"
                                    value={formData.operatorName}
                                    onChange={handleFormInputChange}
                                    placeholder={t('vessels.forms.register.operator.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('vessels.forms.register.operator.help')}</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editVesselTypeName">{t('vessels.forms.register.type.label')}</label>
                                <select
                                    id="editVesselTypeName"
                                    name="vesselTypeName"
                                    value={formData.vesselTypeName}
                                    onChange={handleFormInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">{t('vessels.forms.register.type.placeholder')}</option>
                                    {vesselTypes.map(type => (
                                        <option key={type.id} value={type.name}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                <small className="form-help">{t('vessels.forms.register.type.help')}</small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        {t('vessels.forms.edit.updating')}
                                    </>
                                ) : (
                                    <>
                                        <span>✏️</span>
                                        {t('vessels.forms.edit.submit')}
                                    </>
                                )}
                            </button>

                            <button 
                                type="button" 
                                className="clear-btn"
                                onClick={handleClear}
                                disabled={isUpdating}
                            >
                                <span>🧹</span>
                                {t('common.cancel')}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

console.log('EditVesselForm component loaded! ✏️');