// Delete Dock Form Component
console.log('🗑️ DeleteDockForm component loading...');

const DeleteDockForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [dock, setDock] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('docks.forms.delete.error.required') });
            return;
        }
        
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('docks.forms.delete.error.format') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setDock(null);
        
        try {
            const data = await apiService.getDockById(searchData.id.trim());
            if (data) {
                // Add the ID to the dock data since getDockById doesn't return it
                const dockWithId = { ...data, id: searchData.id.trim() };
                setDock(dockWithId);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('docks.forms.delete.message.search_success') });
            } else {
                setDock(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('docks.forms.delete.error.not_found') });
            }
        } catch (error) {
            console.error('Error fetching dock:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('docks.forms.delete.error.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('common.error') });
            }
            setDock(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== dock.name) {
            setMessage({ 
                type: 'error', 
                text: t('docks.forms.delete.error.confirmation_mismatch') 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            // Delete dock
            await apiService.deleteDock(dock.id);
            
            setMessage({ 
                type: 'success', 
                text: t('docks.forms.delete.success', { dockName: dock.name })
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                // Notify parent component
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting dock:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('docks.forms.delete.error.failed') 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('docks.forms.delete.title')}</h4>
                <p>{t('docks.forms.delete.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* Step 1: Search for Dock */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">{t('docksHubPage.table.id')}</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder={t('docks.forms.delete.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('docks.forms.delete.search_help')}</small>
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
                                    {t('docks.forms.delete.search_button')}
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

            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && dock && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ {t('docks.forms.delete.confirm.title')}</span>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>{t('docks.forms.delete.confirm.search_different')}
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ {t('docks.forms.delete.confirm.to_delete')}:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">{t('docksHubPage.table.id')}:</span><br />{dock.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('docksHubPage.table.name')}:</span><br />{dock.name}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('docksHubPage.table.location')}:</span><br />{dock.location}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('docks.details.dimensions')}:</span><br />{dock.lengthMeters}m × {dock.depthMeters}m × {dock.maxDraftMeters}m</div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">{t('docks.details.allowed_vessel_types')}:</span><br />
                                {dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 ? dock.allowedVesselTypes.join(', ') : t('docksHubPage.table.noneSpecified')}
                            </div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ {t('docks.forms.delete.warning_title')}</span>
                        <span className="delete-warning-desc">{t('docks.forms.delete.warning_description')}</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>
                                    {t('docks.forms.delete.confirmation_text').split('{{dockName}}')[0]}
                                    <strong>{dock.name}</strong>
                                    {t('docks.forms.delete.confirmation_text').split('{{dockName}}')[1]}
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={dock.name}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">{t('docks.forms.delete.confirmation_help')}</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== dock.name}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span>{t('docks.forms.delete.deleting')}</>
                                    ) : (
                                        <>🗑️ {t('docks.forms.delete.submit')}</>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span role="img" aria-label="cancel">🧹</span>
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

console.log('DeleteDockForm component loaded! 🗑️');