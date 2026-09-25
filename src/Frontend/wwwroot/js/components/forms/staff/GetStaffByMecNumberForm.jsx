// Get Staff by MEC Number Form Component

const GetStaffByMecNumberForm = () => {
    const { t } = useTranslation();
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];
    
    const [searchData, setSearchData] = React.useState({
        mecNumber: ''
    });
    const [staff, setStaff] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const mecNumber = searchData.mecNumber.trim();

        if (!mecNumber) {
            setMessage({ type: 'error', text: t("staff.forms.get_by_number.error.required") });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(mecNumber);
            if (data) {
                // Ensure number is present for display purposes
                const staffWithNumber = { ...data, mecanographicNumber: mecNumber };
                setStaff(staffWithNumber);
                setHasSearched(true);
                
                // Concatenate the translated message prefix and the attribute value
                const successPrefix = t('staff.forms.get_by_number.success').replace('{{number}}', '');
                setMessage({ type: 'success', text: successPrefix + mecNumber });
                
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('staff.forms.get_by_number.not_found_with_number', { number: mecNumber }) });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('staff.forms.get_by_number.not_found_with_number', { number: mecNumber }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('staff.forms.get_by_number.error.failed') });
            }
            setStaff(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ mecNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };
    
    // Extract attributes for display
    const mecNumber = getAttr(staff, 'mecanographicNumber');
    const shortName = getAttr(staff, 'shortName');
    const email = getAttr(staff, 'email');
    const phone = getAttr(staff, 'phone');
    const status = getAttr(staff, 'status');
    const operationalWindow = getAttr(staff, 'operationalWindow');
    const qualifications = getAttr(staff, 'qualifications');

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.get_by_number.title')}</h4>
                <p>{t('staff.forms.get_by_number.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchMecNumber">{t('staff.forms.get_by_number.number.label')}</label>
                        <input
                            type="text"
                            id="searchMecNumber"
                            name="mecNumber"
                            value={searchData.mecNumber}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.get_by_number.number.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('staff.forms.get_by_number.number.help')}</small>
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
                                <span>🎯</span>
                                {t('staff.forms.get_by_number.submit')}
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🔄</span>
                        {t('common.clear')}
                    </button>
                </div>
            </form>
            
            {/* Results Section */}
            {hasSearched && staff && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('staff.forms.get_by_number.results.details_title')}</h4>
                        <span className="results-count">{t('staff.forms.get_by_number.results.mec_prefix')}{mecNumber}</span>
                    </div>
                    <div className="staff-details-card">
                        <div className="staff-info-grid">
                            
                            <div className="info-group">
                                <label>{t('staff.columns.name')}</label>
                                <span>{shortName || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('staff.columns.email')}</label>
                                <span>{email || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('staff.columns.phone')}</label>
                                <span>{phone || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('staff.columns.status')}</label>
                                <span>{status || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('staff.columns.operational_window')}</label>
                                <span>{operationalWindow || t('common.na')}</span>
                            </div>
                            
                            <div className="info-group full-width">
                                <label>{t('staff.columns.qualifications')}</label>
                                <div className="qualifications-list">
                                    {qualifications && qualifications.length > 0 ? (
                                        qualifications.map((q, idx) => (
                                            <span key={idx} className="qualification-tag">
                                                {getAttr(q, 'name') || getAttr(q, 'code')}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="no-qualifications">{t('staff.forms.get_by_number.results.qualifications_none')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
