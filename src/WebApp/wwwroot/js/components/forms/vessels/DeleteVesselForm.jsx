// Delete Vessel Form Component
console.log('🗑️ DeleteVesselForm component loading...');

const DeleteVesselForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        imo: ''
    });
    const [vessel, setVessel] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };
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
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('vessels.forms.delete.error.message.success') });
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

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== vessel.vesselName) {
            setMessage({ 
                type: 'error', 
                text: t('vessels.forms.delete.error.confirmation_mismatch') 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            // Delete vessel
            await apiService.deleteVessel(vessel.imo);
            
            setMessage({ 
                type: 'success', 
                text: t('vessels.forms.delete.success', { vesselName: vessel.vesselName })
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                // Notify parent component
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting vessel:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('vessels.forms.delete.error.failed') 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ imo: '' });
        setVessel(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ imo: '' });
        setVessel(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

        return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('vessels.forms.delete.title')}</h4>
                <p>{t('vessels.forms.delete.description')}</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
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
                            <small className="form-help">{t('vessels.forms.delete.search_help')}</small>
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
                                    {t('vessels.forms.delete.search_button')}
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
            {step === 'confirm' && vessel && (
                <>
                    <div className="form-section-header">
                        <h5>⚠️ {t('vessels.forms.delete.confirm_title')}</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 {t('vessels.forms.delete.search_different')}
                        </button>
                    </div>

                    {/* Vessel Details */}
                    <div className="delete-vessel-info">
                        <h6>{t('vessels.forms.delete.vessel_to_delete')}:</h6>
                        <div className="vessel-summary">
                            <div className="summary-item">
                                <strong>{t('vessels.details.imo')}:</strong> {vessel.imo}
                            </div>
                            <div className="summary-item">
                                <strong>{t('vessels.details.name')}:</strong> {vessel.vesselName}
                            </div>
                            <div className="summary-item">
                                <strong>{t('vessels.details.operator')}:</strong> {vessel.operatorName}
                            </div>
                            <div className="summary-item">
                                <strong>{t('vessels.details.type')}:</strong> {vessel.vesselTypeName}
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Form */}
                    <form onSubmit={handleDelete} className="delete-form">
                        <div className="danger-zone">
                            <div className="danger-header">
                                <h6>⚠️ {t('vessels.forms.delete.warning_title')}</h6>
                                <p>{t('vessels.forms.delete.warning_description')}</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmationText">
                                    {t('vessels.forms.delete.confirmation_text')} "<strong>{vessel.vesselName}</strong>" {t('vessels.forms.delete.to_confirm')}:
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={vessel.vesselName}
                                    className="form-input danger-input"
                                    required
                                />
                                <small className="form-help danger-help">
                                    {t('vessels.forms.delete.confirmation_help')}
                                </small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="delete-btn"
                                disabled={isDeleting || confirmationText !== vessel.vesselName}
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        {t('vessels.forms.delete.deleting')}
                                    </>
                                ) : (
                                    <>
                                        <span>🗑️</span>
                                        {t('vessels.forms.delete.submit')}
                                    </>
                                )}
                            </button>

                            <button 
                                type="button" 
                                className="clear-btn"
                                onClick={handleClear}
                                disabled={isDeleting}
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

console.log('DeleteVesselForm component loaded! 🗑️');