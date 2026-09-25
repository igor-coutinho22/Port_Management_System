// Delete Organization Form Component

const DeleteOrganizationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [organization, setOrganization] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search');
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

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('organizations.forms.delete.error.required') });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('organizations.forms.delete.error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setOrganization(null);
        try {
            const data = await apiService.getOrganizationById(searchData.id.trim());
            if (data) {
                const orgWithId = { ...data, id: searchData.id.trim() };
                setOrganization(orgWithId);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('organizations.forms.delete.message.search_success') });
            } else {
                setOrganization(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('organizations.forms.delete.search_error.not_found') });
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: t('organizations.forms.delete.search_error.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('organizations.forms.delete.search_error.failed') });
            }
            setOrganization(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        const legalName = organization.legalName || organization.LegalName || '';

        if (confirmationText !== legalName) {
            setMessage({ type: 'error', text: t('organizations.forms.delete.confirmation_mismatch') });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            const orgId = organization.id || organization.Id;
            await apiService.deleteOrganization(orgId);
            
            setMessage({ 
                type: 'success', 
                text: t('organizations.forms.delete.success', { legalName: legalName }) 
            });
            
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
            
        } catch (error) {
            console.error('Error deleting organization:', error);
            setMessage({ type: 'error', text: error.message || t('organizations.forms.delete.error.failed') });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };
    
    // Helper to extract attribute values reliably
    const getAttr = (org, key) => org?.[key] || org?.[key.charAt(0).toUpperCase() + key.slice(1)];
    const orgLegalName = getAttr(organization, 'legalName');
    const orgAddress = getAttr(organization, 'address');
    const orgId = getAttr(organization, 'id');
    const orgReps = getAttr(organization, 'representatives');

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.delete.title')}</h4>
                <p>{t('organizations.forms.delete.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* Step 1: Search for Organization */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">{t('organizations.forms.delete.id.label')}</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder={t('organizations.forms.delete.id.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('organizations.forms.delete.id.help')}</small>
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
                                    {t('organizations.forms.delete.search_button')}
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
                            {t('organizations.forms.delete.cancel')}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && organization && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ {t('organizations.forms.delete.confirm.title')}</span>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>{t('organizations.forms.delete.confirm.search_different')}
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ {t('organizations.forms.delete.confirm.to_delete')}:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('organizationsHubPage.table.id')}:</span><br />
                                {orgId}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('organizationsHubPage.table.legalName')}:</span><br />
                                {orgLegalName}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('organizationsHubPage.table.address')}:</span><br />
                                {orgAddress}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('organizationsHubPage.table.representatives')}:</span><br />
                                {orgReps && orgReps.length > 0 
                                    ? orgReps.map(r => r.name || r.Name).join(', ') 
                                    : t('organizations.forms.delete.confirm.reps_none')
                                }
                            </div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ {t('organizations.forms.delete.warning_title')}</span>
                        <span className="delete-warning-desc">{t('organizations.forms.delete.warning_description')}</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                {/* FIX: Rebuild the label string using the translated part + the bolded, untranslated attribute name */}
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>
                                    {/* Get the translated string part, which should be: "Type " to " to confirm deletion:" */}
                                    {t('organizations.forms.delete.confirmation_prompt').split('{{legalName}}')[0]}
                                    <strong>{orgLegalName}</strong>
                                    {t('organizations.forms.delete.confirmation_prompt').split('{{legalName}}')[1]}
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={orgLegalName}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">{t('organizations.forms.delete.confirmation_help')}</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== orgLegalName}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span>{t('organizations.forms.delete.deleting')}</>
                                    ) : (
                                        <>🗑️ {t('organizations.forms.delete.submit')}</>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span role="img" aria-label="cancel">🧹</span>
                                    {t('organizations.forms.delete.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
