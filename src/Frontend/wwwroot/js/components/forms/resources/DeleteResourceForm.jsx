// Delete Resource Form Component

const DeleteResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [resource, setResource] = React.useState(null);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate resource ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('resources.forms.delete.error.required') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResource(null);
        
        try {
            const data = await apiService.getResourceById(searchData.id.trim());
            if (data) {
                setResource(data);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('resources.forms.delete.search_success') });
            } else {
                setResource(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('resources.forms.delete.search_not_found') });
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('resources.forms.delete.search_error.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('resources.forms.delete.search_error.failed') });
            }
            setResource(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== resource.description) {
            setMessage({ 
                type: 'error', 
                text: t('resources.forms.delete.confirm.mismatch') 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.deleteResource(resource.id);
            
            setMessage({ 
                type: 'success', 
                text: t('resources.forms.delete.success')
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting resource:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('resources.forms.delete.delete_error.failed') 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const getResourceTypeLabel = (resourceType) => {
        const types = {
            'STSCrane': 'STS Crane',
            'YardCrane': 'Yard Crane',
            'Truck': 'Truck',
            'Tractor': 'Tractor'
        };
        return types[resourceType] || resourceType;
    };
    
    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('resources.forms.delete.title')}</h4>
                <p>{t('resources.forms.delete.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* Step 1: Search for Resource */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">{t('resources.forms.delete.id.label')}</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter resource ID"
                                className="form-input"
                            />
                            <small className="form-help">{t('resources.forms.delete.id.help')}</small>
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
                                    {t('resources.forms.delete.search_button')}
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
                            {t('resources.forms.delete.cancel')}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && resource && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ {t('resources.forms.delete.confirm.title')}</span>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>{t('resources.forms.delete.confirm.search_different')}
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ {t('resources.forms.delete.confirm.to_delete')}</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{resource.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('resources.details.description_label')}:</span><br />{resource.description}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('resources.details.type_label')}:</span><br />{getResourceTypeLabel(resource.resourceType)}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('resources.details.status_label')}:</span><br /><span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>{resource.status || 'N/A'}</span></div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('resources.details.capacity_label')}:</span><br />{resource.operationalCapacity}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('resources.details.setup_time_label')}:</span><br />{resource.setupTime} {t('resources.details.minutes_unit')}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ {t('resources.forms.delete.confirm.warning_title_short')}</span>
                        <span className="delete-warning-desc">{t('resources.forms.delete.confirm.warning_description')}</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>{t('resources.forms.delete.confirmation_prompt')} "<strong>{resource.description}</strong>" {t('resources.forms.delete.confirmation_prompt_continued')}</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={resource.description}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">{t('resources.forms.delete.confirmation_help')}</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== resource.description}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span>{t('resources.forms.delete.deleting')}...</>
                                    ) : (
                                        <>🗑️ {t('resources.forms.delete.submit')}</>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span role="img" aria-label="cancel">🧹</span>
                                    {t('resources.forms.delete.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};
