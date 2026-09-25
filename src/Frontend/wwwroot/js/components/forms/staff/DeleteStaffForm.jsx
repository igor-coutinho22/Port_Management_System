// Delete Staff Form Component

const DeleteStaffForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];
    
    const [searchData, setSearchData] = React.useState({
        mecanographicNumber: ''
    });
    const [staff, setStaff] = React.useState(null);
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
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const staffNumber = searchData.mecanographicNumber.trim();
        
        if (!staffNumber) {
            setMessage({ type: 'error', text: t('staff.forms.delete.error.required') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(staffNumber);
            if (data) {
                // Ensure data uses a consistent key for number
                const staffWithNumber = { ...data, mecanographicNumber: staffNumber };
                setStaff(staffWithNumber);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: t('staff.forms.delete.search_success') });
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('staff.forms.delete.search_error.not_found', { number: staffNumber }) });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('staff.forms.delete.search_error.not_found', { number: staffNumber }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('staff.forms.delete.search_error.failed') });
            }
            setStaff(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        const staffShortName = getAttr(staff, 'shortName') || '';

        if (confirmationText !== staffShortName) {
            setMessage({
                type: 'error',
                text: t('staff.forms.delete.confirmation_mismatch')
            });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteStaff(getAttr(staff, 'mecanographicNumber'));
            setMessage({
                type: 'success',
                text: t('staff.forms.delete.success', { name: staffShortName })
            });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            console.error('Error deleting staff:', error);
            setMessage({
                type: 'error',
                text: error.message || t('staff.forms.delete.error.failed')
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ mecanographicNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ mecanographicNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };
    
    // Attributes derived for display
    const mecNumber = getAttr(staff, 'mecanographicNumber');
    const shortName = getAttr(staff, 'shortName');
    const email = getAttr(staff, 'email');
    const phone = getAttr(staff, 'phone');
    const status = getAttr(staff, 'status');
    const window = getAttr(staff, 'operationalWindow');


    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.delete.title')}</h4>
                <p>{t('staff.forms.delete.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Staff */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchMecanographicNumber">{t('staff.forms.delete.number.label')}</label>
                            <input
                                type="text"
                                id="searchMecanographicNumber"
                                name="mecanographicNumber"
                                value={searchData.mecanographicNumber}
                                onChange={handleSearchInputChange}
                                placeholder={t('staff.forms.delete.number.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('staff.forms.delete.number.help')}</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (<><span className="loading-spinner"></span>{t('staff.forms.delete.searching')}</>) : (<>{t('staff.forms.delete.search_button')}</>)}
                        </button>
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            <span>🧹</span>
                            {t('staff.forms.delete.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Confirm Deletion */}
            {step === 'confirm' && staff && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ {t('staff.forms.delete.confirm.title')}</span>
                        <button
                            type="button"
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>{t('staff.forms.delete.confirm.search_different')}
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ {t('staff.forms.delete.confirm.to_delete')}</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.mec_number')}:</span><br />{mecNumber}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.name')}:</span><br />{shortName}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.email')}:</span><br />{email}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.phone')}:</span><br />{phone}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.status')}:</span><br />{status}</div>
                            <div className="delete-details-field"><span className="delete-details-label">{t('staff.forms.delete.confirm.window')}:</span><br />{window}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ {t('staff.forms.delete.confirm.warning_title')}</span>
                        <span className="delete-warning-desc">{t('staff.forms.delete.confirm.warning_description')}</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmDelete" style={{ color: '#fff', fontWeight: 500 }}>{t('staff.forms.delete.confirmation_prompt')} "<strong>{shortName}</strong>" {t('staff.forms.delete.confirmation_prompt_continued')}</label>
                                <input
                                    type="text"
                                    id="confirmDelete"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={shortName}
                                    className="delete-confirm-input"
                                    autoComplete="off"
                                    required
                                />
                                <small className="delete-confirm-help">{t('staff.forms.delete.confirmation_help')}</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    type="submit"
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== shortName}
                                >
                                    {isDeleting ? (<><span className="loading-spinner"></span>{t('staff.forms.delete.deleting')}</>) : (<>🗑️ {t('staff.forms.delete.submit')}</>)}
                                </button>
                                <button
                                    type="button"
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span>🧹</span>
                                    {t('staff.forms.delete.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
