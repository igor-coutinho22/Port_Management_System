// Edit Qualification Form Component

const EditQualificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ code: '' });
    const [formData, setFormData] = React.useState({ code: '', name: '' });
    const [qualification, setQualification] = React.useState(null);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.code.trim()) {
            setMessage({ type: 'error', text: t('qualifications.forms.edit.error.required') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        
        const searchCode = searchData.code.trim();

        try {
            const data = await apiService.getQualificationByCode(searchCode);
            const qualCode = data.code || data.Code || searchCode; // Handle Pascal/camel case

            if (data) {
                // Ensure code is present for consistency
                const qualificationWithCode = { ...data, code: qualCode };
                setQualification(qualificationWithCode);
                setFormData({
                    code: qualCode,
                    name: data.name || data.Name || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: t('qualifications.forms.edit.search_success_message', { code: qualCode }) });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('qualifications.forms.edit.search_error.not_found_with_code', { code: searchCode }) });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('qualifications.forms.edit.search_error.not_found_with_code', { code: searchCode }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('qualifications.forms.edit.search_error.failed') });
            }
            setQualification(null);
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
            if (!formData.code?.trim()) throw new Error(t('qualifications.forms.edit.error.required'));
            if (!formData.name?.trim()) throw new Error(t('qualifications.forms.edit.error.name_required'));
            
            const qualificationData = {
                Code: formData.code.trim(),
                Name: formData.name.trim()
            };
            
            await apiService.updateQualification(formData.code, qualificationData);
            
            setMessage({ type: 'success', text: t('qualifications.forms.edit.update_success') });
            
            if (onSuccess) onSuccess();
            
        } catch (error) {
            setMessage({ type: 'error', text: error.message || t('qualifications.forms.edit.update_error') });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setFormData({ code: '', name: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const qualName = qualification?.name || qualification?.Name || formData.name;
    const qualCode = qualification?.code || qualification?.Code || formData.code;

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('qualifications.forms.edit.title')}</h4>
                <p>{t('qualifications.forms.edit.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Qualification */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchCode">{t('qualifications.forms.edit.code.label')}</label>
                            <input
                                type="text"
                                id="searchCode"
                                name="code"
                                value={searchData.code}
                                onChange={handleSearchInputChange}
                                placeholder={t('qualifications.forms.edit.code.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('qualifications.forms.edit.code.help')}</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('qualifications.forms.edit.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('qualifications.forms.edit.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Qualification Form */}
            {step === 'edit' && qualification && (
                <>
                    <div className="form-section-header">
                        <h5>
                            {t('qualifications.forms.edit.editing_header')}: <strong>{qualCode}</strong> {'('} <strong>{qualName}</strong> {')'}
                        </h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span>🔍</span> {t('qualifications.forms.edit.search_different')}
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="qualification-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editCode">{t('qualifications.forms.edit.code.label')}</label>
                                <input
                                    type="text"
                                    id="editCode"
                                    name="code"
                                    value={formData.code}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">{t('qualifications.forms.edit.code_readonly_help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editName">{t('qualifications.forms.edit.name.label')}</label>
                                <input
                                    type="text"
                                    id="editName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormInputChange}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('qualifications.forms.edit.name.help')}</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? (
                                    <><span className="loading-spinner"></span>{t('qualifications.forms.edit.updating')}</>
                                ) : (
                                    <><span>✏️</span>{t('qualifications.forms.edit.update_button')}</>
                                )}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                                <span>🧹</span>{t('qualifications.forms.edit.cancel')}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
