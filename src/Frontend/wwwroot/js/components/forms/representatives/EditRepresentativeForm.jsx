// Edit Representative Form Component

const EditRepresentativeForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        nationality: '',
        email: '',
        phone: ''
    });
    const [representative, setRepresentative] = React.useState(null);
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
            setMessage({ type: 'error', text: t('representatives.forms.edit.search_error.required') });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('representatives.forms.edit.search_error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setRepresentative(null);
        try {
            const data = await apiService.getRepresentativeById(searchData.id.trim());
            if (data) {
                setRepresentative(data);
                setFormData({
                    nationality: data.nationality || '',
                    email: data.email || '',
                    phone: data.phone || ''
                });
                setStep('edit');
                setHasSearched(true);
                setMessage({ type: 'success', text: t('representatives.forms.edit.search_success') });
            } else {
                setRepresentative(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('representatives.forms.edit.search_error.not_found') });
            }
        } catch (error) {
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('representatives.forms.edit.search_error.not_found_with_id') });
            } else {
                setMessage({ type: 'error', text: error.message || t('representatives.forms.edit.search_error.failed') });
            }
            setRepresentative(null);
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
            await apiService.updateRepresentative(searchData.id.trim(), formData);
            setMessage({ type: 'success', text: t('representatives.forms.edit.update_success') });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || t('representatives.forms.edit.update_error') });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({ nationality: '', email: '', phone: '' });
        setRepresentative(null);
        setHasSearched(false);
        setStep('search');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('representatives.forms.edit.title')}</h4>
                <p>{t('representatives.forms.edit.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">{t('representatives.forms.edit.id.label')}</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder={t('representatives.forms.edit.id.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('representatives.forms.edit.id.help')}</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('representatives.forms.edit.loading')}</>) : (<><span>✏️</span>{t('representatives.forms.edit.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🔄</span>{t('representatives.forms.edit.clear')}
                        </button>
                    </div>
                </form>
            )}
            {step === 'edit' && representative && (
                <form onSubmit={handleUpdate} className="edit-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('representatives.forms.edit.nationality.label')}</label>
                            <input
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={3}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('representatives.forms.edit.email.label')}</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={200}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('representatives.forms.edit.phone.label')}</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={32}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isUpdating}>
                            {isUpdating ? (<><span className="loading-spinner"></span>{t('representatives.forms.edit.updating')}</>) : (<><span>💾</span>{t('representatives.forms.edit.update_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                            <span>🔄</span>{t('representatives.forms.edit.clear')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
