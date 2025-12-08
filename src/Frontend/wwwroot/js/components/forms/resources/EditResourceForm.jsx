// Edit Resource Form Component
console.log('✏️ EditResourceForm component loading...');

const EditResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];

    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [formData, setFormData] = React.useState({
        id: '',
        description: '',
        resourceType: '',
        operationalCapacity: '',
        setupTime: '',
        qualificationRequirements: []
    });
    const [qualifications, setQualifications] = React.useState([]);
    const [resource, setResource] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    // Resource type options (LOGIC UNCHANGED)
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
            setMessage({ type: 'error', text: t('resources.forms.edit.error.load_qualifications') });
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

    const handleQualificationToggle = (qualificationCode) => {
        // LOGIC UNCHANGED
        setFormData(prev => {
            const isCurrentlySelected = prev.qualificationRequirements.includes(qualificationCode);
            const newRequirements = isCurrentlySelected
                ? prev.qualificationRequirements.filter(code => code !== qualificationCode)
                : [...prev.qualificationRequirements, qualificationCode];
                
            return {
                ...prev,
                qualificationRequirements: newRequirements
            };
        });
    };

    const handleQualificationChange = (e) => {
        // LOGIC UNCHANGED
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            qualificationRequirements: selectedOptions
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate resource ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('resources.forms.edit.error.required') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResource(null);
        
        const searchId = searchData.id.trim();

        try {
            const data = await apiService.getResourceById(searchId);
            
            if (data) {
                setResource(data);
                
                // Find index corresponding to the resourceType value
                const resourceTypeIndex = resourceTypes.findIndex(type => type.value === getAttr(data, 'resourceType'));
                
                // LOGIC UNCHANGED: Map fetched data to form state
                setFormData({
                    id: getAttr(data, 'id') || '',
                    description: getAttr(data, 'description') || '',
                    resourceType: resourceTypeIndex !== -1 ? resourceTypeIndex.toString() : '',
                    operationalCapacity: getAttr(data, 'operationalCapacity') || '',
                    setupTime: getAttr(data, 'setupTime') || '',
                    qualificationRequirements: getAttr(data, 'qualificationRequirements') ? 
                        getAttr(data, 'qualificationRequirements').map(q => getAttr(q, 'code') || q) : []
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: t('resources.forms.edit.search_success') });
            } else {
                setResource(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('resources.forms.edit.search_error.not_found') });
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('resources.forms.edit.search_error.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('resources.forms.edit.search_error.failed') });
            }
            setResource(null);
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
            if (!formData.id?.trim() || !formData.description?.trim() || 
                !formData.operationalCapacity?.toString().trim() || !formData.setupTime?.toString().trim()) {
                throw new Error(t('resources.forms.edit.error.all_fields_required'));
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.operationalCapacity)) || parseInt(formData.operationalCapacity) <= 0) {
                throw new Error(t('resources.forms.edit.error.capacity_invalid'));
            }
            if (isNaN(parseInt(formData.setupTime)) || parseInt(formData.setupTime) < 0) {
                throw new Error(t('resources.forms.edit.error.setup_time_invalid'));
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

            // Update resource
            await apiService.updateResource(formData.id, resourceData);
            
            setMessage({ type: 'success', text: t('resources.forms.edit.update_success') });
            
            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error updating resource:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('resources.forms.edit.update_error') 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            description: '',
            resourceType: '',
            operationalCapacity: '',
            setupTime: '',
            qualificationRequirements: []
        });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleSearchDifferent = () => {
        // LOGIC UNCHANGED
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setSearchData({ id: '' });
    };
    
    // Derived values for header display
    const resourceDescription = resource?.description || resource?.Description || '';
    const resourceID = resource?.id || resource?.Id || '';


    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('resources.forms.edit.title')}</h4>
                <p>{t('resources.forms.edit.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {step === 'search' && (
                <div className="search-section">
                    <h5>{t('resources.forms.edit.search_section_title')}</h5>
                    <p className="help-text">{t('resources.forms.edit.search_section_help')}</p>
                    
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="form-group">
                            <label htmlFor="searchResourceId">{t('resources.forms.edit.id.label')}</label>
                            <input
                                type="text"
                                id="searchResourceId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder={t('resources.forms.edit.id.placeholder')}
                                className="form-input"
                                required
                            />
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
                                        {t('resources.forms.edit.search_button')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 'edit' && resource && (
                <div className="edit-section">
                    <div className="form-section-header">
                        {/* UNTRANSLATED ATTRIBUTES */}
                        <h5>{t('resources.forms.edit.editing_header')}: <strong>{resourceDescription}</strong> {'('} <strong>{resourceID}</strong> {')'}</h5>
                        <button 
                            type="button"
                            onClick={handleSearchDifferent}
                            className="link-btn"
                        >
                            <span>🔍</span> {t('resources.forms.edit.search_different')}
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="resource-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editResourceId">{t('resources.forms.edit.id.label')}</label>
                                <input
                                    type="text"
                                    id="editResourceId"
                                    name="id"
                                    value={formData.id}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">{t('resources.forms.edit.id_readonly_help')}</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editDescription">{t('resources.forms.edit.description.label')}</label>
                                <input
                                    type="text"
                                    id="editDescription"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormInputChange}
                                    placeholder={t('resources.forms.edit.description.placeholder')}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editResourceType">{t('resources.forms.edit.type.label')}</label>
                                <select
                                    id="editResourceType"
                                    name="resourceType"
                                    value={formData.resourceType}
                                    onChange={handleFormInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">{t('resources.forms.edit.type.select_placeholder')}</option>
                                    {resourceTypes.map((type, index) => (
                                        <option key={type.value} value={index}>
                                            {/* TRANSLATED LABEL */}
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editOperationalCapacity">{t('resources.forms.edit.capacity.label')}</label>
                                <input
                                    type="number"
                                    id="editOperationalCapacity"
                                    name="operationalCapacity"
                                    value={formData.operationalCapacity}
                                    onChange={handleFormInputChange}
                                    placeholder={t('resources.forms.edit.capacity.placeholder')}
                                    min="1"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editSetupTime">{t('resources.forms.edit.setup_time.label')}</label>
                                <input
                                    type="number"
                                    id="editSetupTime"
                                    name="setupTime"
                                    value={formData.setupTime}
                                    onChange={handleFormInputChange}
                                    placeholder={t('resources.forms.edit.setup_time.placeholder')}
                                    min="0"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="editQualificationRequirements">{t('resources.forms.edit.qualifications.label')}</label>
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
                                <small className="form-help">{t('resources.forms.edit.qualifications.help')}</small>
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
                                        {t('resources.forms.edit.updating')}
                                    </>
                                ) : (
                                    <>
                                        <span>✏️</span>
                                        {t('resources.forms.edit.update_button')}
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
                                {t('resources.forms.edit.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

console.log('EditResourceForm component loaded! ✏️');