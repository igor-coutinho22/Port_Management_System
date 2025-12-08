// Edit Organization Form Component
console.log('EditOrganizationForm component loading...');

const EditOrganizationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        id: '',
        alternativeNames: '',
        address: ''
    });
    const [organization, setOrganization] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('organizations.forms.edit.search_error.required') });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('organizations.forms.edit.search_error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setOrganization(null);
        try {
            const data = await apiService.getOrganizationById(searchData.id.trim());
            if (data) {
                setOrganization(data);
                // Use the searchData.id for formData since the API response doesn't always contain the ID field consistently
                setFormData({
                    id: searchData.id.trim(),
                    alternativeNames: data.alternativeNames || '',
                    address: data.address || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: t('organizations.forms.edit.search_success') });
            } else {
                setOrganization(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('organizations.forms.edit.search_error.not_found') });
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('organizations.forms.edit.search_error.not_found_with_id') });
            } else {
                setMessage({ type: 'error', text: error.message || t('organizations.forms.edit.search_error.failed') });
            }
            setOrganization(null);
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
            if (!formData.address?.trim()) {
                throw new Error(t('organizations.forms.edit.error.address_required'));
            }
            // Prepare DTO for backend
            const orgData = {
                AlternativeNames: formData.alternativeNames.trim(),
                Address: formData.address.trim()
            };
            await apiService.updateOrganization(formData.id, orgData);
            setMessage({ type: 'success', text: t('organizations.forms.edit.update_success') });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating organization:', error);
            setMessage({ type: 'error', text: error.message || t('organizations.forms.edit.update_error') });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            alternativeNames: '',
            address: ''
        });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const orgLegalName = organization?.legalName || organization?.LegalName || 'N/A';
    const orgDisplayId = organization?.id || organization?.Id || formData.id;

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.edit.title')}</h4>
                <p>{t('organizations.forms.edit.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            
            {/* Step 1: Search for Organization */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">{t('organizations.forms.edit.id.label')}</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder={t('organizations.forms.edit.id.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('organizations.forms.edit.id.help')}</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('organizations.forms.edit.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('organizations.forms.edit.cancel')}
                        </button>
                    </div>
                </form>
            )}
            
            {/* Step 2: Edit Organization Form */}
            {step === 'edit' && organization && (
                <>
                    <div className="form-section-header">
                        <h5>
                            {t('organizations.forms.edit.editing_header')}: <strong> {orgLegalName} (ID: {orgDisplayId})</strong>
                        </h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span>🔍</span> {t('organizations.forms.edit.search_different')}
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="organization-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editId">{t('organizations.forms.edit.id.label')}</label>
                                <input 
                                    type="text" 
                                    id="editId" 
                                    name="id" 
                                    value={formData.id} 
                                    className="form-input" 
                                    disabled 
                                />
                                <small className="form-help">{t('organizations.forms.edit.id_readonly_help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAlternativeNames">{t('organizations.forms.edit.alt_names.label')}</label>
                                <input 
                                    type="text" 
                                    id="editAlternativeNames" 
                                    name="alternativeNames" 
                                    value={formData.alternativeNames} 
                                    onChange={handleFormInputChange} 
                                    placeholder={t('organizations.forms.edit.alt_names.placeholder')} 
                                    className="form-input" 
                                />
                                <small className="form-help">{t('organizations.forms.edit.alt_names.help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAddress">
                                    {t('organizations.forms.edit.address.label')} <span className="required">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="editAddress" 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleFormInputChange} 
                                    placeholder={t('organizations.forms.edit.address.placeholder')} 
                                    className="form-input" 
                                    required 
                                />
                                <small className="form-help">{t('organizations.forms.edit.address.help')}</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? (
                                    <><span className="loading-spinner"></span>{t('organizations.forms.edit.updating')}</>
                                ) : (
                                    <><span>✏️</span>{t('organizations.forms.edit.update_button')}</>
                                )}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                                <span>🧹</span>{t('organizations.forms.edit.cancel')}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

console.log('EditOrganizationForm component loaded!');