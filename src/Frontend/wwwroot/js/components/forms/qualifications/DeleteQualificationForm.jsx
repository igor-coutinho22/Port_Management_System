// Delete Qualification Form Component

function DeleteQualificationForm({ onSuccess }) {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ code: '' });
    const [qualification, setQualification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.code.trim()) {
            setMessage({ type: 'error', text: t('qualifications.forms.delete.error.required') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        try {
            const data = await apiService.getQualificationByCode(searchData.code.trim());
            if (data) {
                // Add the code to the qualification data if not present
                const qualificationWithCode = { ...data, code: searchData.code.trim() };
                setQualification(qualificationWithCode);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('qualifications.forms.delete.message.search_success') });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('qualifications.forms.delete.search_error.not_found_with_code') });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('qualifications.forms.delete.search_error.not_found_with_code') });
            } else {
                setMessage({ type: 'error', text: error.message || t('qualifications.forms.delete.search_error.failed') });
            }
            setQualification(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        const qualName = qualification.name || qualification.Name || '';

        if (confirmationText !== qualName) {
            setMessage({ type: 'error', text: t('qualifications.forms.delete.confirmation_mismatch') });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            const qualCode = qualification.code || qualification.Code;
            await apiService.deleteQualification(qualCode);
            
            setMessage({ 
                type: 'success', 
                text: t('qualifications.forms.delete.success', { name: qualName }) 
            });
            
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
            
        } catch (error) {
            console.error('Error deleting qualification:', error);
            setMessage({ type: 'error', text: error.message || t('qualifications.forms.delete.error.failed') });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const qualName = qualification?.name || qualification?.Name || '';
    const qualCode = qualification?.code || qualification?.Code || '';

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('qualifications.forms.delete.title')}</h4>
                <p>{t('qualifications.forms.delete.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Qualification */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchCode">{t('qualifications.forms.delete.code.label')}</label>
                            <input
                                type="text"
                                id="searchCode"
                                name="code"
                                value={searchData.code}
                                onChange={handleSearchInputChange}
                                placeholder={t('qualifications.forms.delete.code.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('qualifications.forms.delete.code.help')}</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<>{t('qualifications.forms.delete.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('qualifications.forms.delete.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Confirm Deletion */}
            {step === 'confirm' && qualification && (
                <>
                    <div className="delete-form-header">
                        <span>
                            ⚠️ {t('qualifications.forms.delete.confirm.title')} <strong>{qualName}</strong> 
                            <span style={{ fontWeight: 400 }}>{t('qualifications.forms.delete.confirm.title_suffix')} <strong>{qualCode}</strong></span>
                        </span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span style={{ marginRight: '4px' }}>🔍</span>{t('qualifications.forms.delete.confirm.search_different')}
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ {t('qualifications.forms.delete.confirm.to_delete')}:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            {/* Qualification attributes displayed using translated column headers */}
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('qualificationsHubPage.table.code')}:</span><br />
                                {qualCode}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('qualificationsHubPage.table.name')}:</span><br />
                                {qualName}
                            </div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ {t('qualifications.forms.delete.confirm.warning_title')}</span>
                        <span className="delete-warning-desc">{t('qualifications.forms.delete.confirm.warning_description')}</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmName" style={{ color: '#fff', fontWeight: 500 }}>
                                    {t('qualifications.forms.delete.confirmation_prompt').split('{{name}}')[0]}
                                    <strong>{qualName}</strong>
                                    {t('qualifications.forms.delete.confirmation_prompt').split('{{name}}')[1]}
                                </label>
                                <input
                                    type="text"
                                    id="confirmName"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={qualName}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">{t('qualifications.forms.delete.confirmation_help')}</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== qualName}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>{t('qualifications.forms.delete.deleting')}</>) : (<>🗑️ {t('qualifications.forms.delete.submit')}</>)}
                                </button>
                                <button type="button" className="delete-cancel-btn" onClick={handleClear} disabled={isDeleting}>
                                    <span role="img" aria-label="cancel">🧹</span>{t('qualifications.forms.delete.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
